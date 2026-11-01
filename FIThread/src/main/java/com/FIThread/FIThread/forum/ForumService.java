package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import com.FIThread.FIThread.forum.ForumDtos.*;
import com.FIThread.FIThread.review.ModerationAction;
import com.FIThread.FIThread.review.ModerationService;
import com.FIThread.FIThread.user.Role;
import com.FIThread.FIThread.user.User;
import com.FIThread.FIThread.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ForumService {

    private static final int MAX_LENGTH = 500;
    private static final int MAX_TAGS = 5;
    private static final int MAX_THREAD_NODES = 500;
    private static final Pattern TAG = Pattern.compile("(?<![\\p{L}\\p{N}_])#([\\p{L}\\p{N}_]{1,50})");

    private final ForumPostRepository postRepository;
    private final ForumLikeRepository likeRepository;
    private final ForumReportRepository reportRepository;
    private final ForumModerationLogRepository logRepository;
    private final UserRepository userRepository;
    private final ModerationService moderationService;
    private final ForumRateLimiter rateLimiter;
    private final AppProperties appProperties;

    // ---------- doc ----------

    @Transactional(readOnly = true)
    public PostPage feed(String email, String tag, String q, boolean mine, int page, int size) {
        User viewer = findUser(email);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 30),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));

        Page<ForumPost> result;
        if (mine) {
            result = postRepository.findMineRoots(viewer.getId(), ForumPostStatus.DELETED, pageable);
        } else {
            String pattern = (q == null || q.isBlank()) ? null : "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
            result = postRepository.searchRoots(ForumPostStatus.PUBLISHED, pattern, normalizeTag(tag), pageable);
        }
        return new PostPage(toViews(result.getContent(), viewer), result.getNumber(),
                result.getTotalPages(), result.getTotalElements());
    }
    @Transactional(readOnly = true)
    public List<FeaturedThread> featuredThreads(String email, int size) {
        User viewer = findUser(email);

        int limit = Math.min(Math.max(size, 1), 10);

        // Lấy nhiều ứng viên để có thể chọn các thread khác nhau.
        List<Object[]> candidates = postRepository.findFeaturedComments(
                ForumPostStatus.PUBLISHED,
                ForumPostStatus.PUBLISHED,
                PageRequest.of(0, Math.min(limit * 10, 100))
        );

        // Mỗi thread chỉ hiển thị một bình luận nổi bật.
        Map<Long, ForumPost> roots = new LinkedHashMap<>();
        Map<Long, ForumPost> comments = new LinkedHashMap<>();

        for (Object[] row : candidates) {
            ForumPost comment = (ForumPost) row[0];
            Long rootId = comment.getRootId();

            if (rootId == null || comments.containsKey(rootId)) {
                continue;
            }

            ForumPost root = roots.get(rootId);

            if (root == null) {
                root = postRepository.findById(rootId).orElse(null);

                if (root == null
                        || root.getParentId() != null
                        || root.getStatus() != ForumPostStatus.PUBLISHED) {
                    continue;
                }

                roots.put(rootId, root);
            }

            comments.put(rootId, comment);

            if (comments.size() >= limit) {
                break;
            }
        }

        // Chuyển thành PostView theo cùng logic của feed hiện tại.
        List<ForumPost> posts = new ArrayList<>();

        for (Long rootId : comments.keySet()) {
            posts.add(roots.get(rootId));
            posts.add(comments.get(rootId));
        }

        List<PostView> views = toViews(posts, viewer);
        Map<Long, PostView> viewsById = new HashMap<>();

        for (PostView view : views) {
            viewsById.put(view.id(), view);
        }

        List<FeaturedThread> result = new ArrayList<>();

        for (Long rootId : comments.keySet()) {
            PostView rootView = viewsById.get(rootId);
            PostView commentView = viewsById.get(comments.get(rootId).getId());

            if (rootView != null && commentView != null) {
                result.add(new FeaturedThread(rootView, commentView));
            }
        }

        return result;
    }

    /** Mo mot cuoc thao luan (neu id la mot tra loi thi mo cuoc thao luan chua no). */
    @Transactional(readOnly = true)
    public ThreadView thread(String email, Long id) {
        User viewer = findUser(email);
        ForumPost start = find(id);
        Long rootId = start.getRootId() != null ? start.getRootId() : start.getId();
        ForumPost root = rootId.equals(start.getId()) ? start : find(rootId);

        if (!canView(root, viewer)) {
            throw new BusinessException("Khong tim thay bai viet", HttpStatus.NOT_FOUND);
        }

        // Chi lay nhung tra loi con noi duoc toi bai goc: tra loi duoi mot bai bi an cung bi an theo
        Set<Long> visible = new HashSet<>(List.of(rootId));
        List<ForumPost> replies = new ArrayList<>();
        for (ForumPost node : postRepository.findByRootIdAndStatusInOrderByCreatedAtAscIdAsc(
                rootId, List.of(ForumPostStatus.PUBLISHED, ForumPostStatus.DELETED))) {
            if (visible.contains(node.getParentId()) && replies.size() < MAX_THREAD_NODES) {
                visible.add(node.getId());
                replies.add(node);
            }
        }

        List<ForumPost> all = new ArrayList<>();
        all.add(root);
        all.addAll(replies);
        List<PostView> views = toViews(all, viewer);
        return new ThreadView(views.get(0), views.subList(1, views.size()));
    }

    @Transactional(readOnly = true)
    public List<TagCount> trendingTags() {
        return postRepository.trendingTags(ForumPostStatus.PUBLISHED, PageRequest.of(0, 10)).stream()
                .map(r -> new TagCount((String) r[0], ((Number) r[1]).longValue()))
                .toList();
    }

    // ---------- ghi ----------

    @Transactional
    public PostView create(String email, String rawContent) {
        User user = findUser(email);
        String content = validateContent(rawContent);
        rateLimiter.check(email);

        ForumPost post = new ForumPost();
        post.setAuthor(user);
        post.setContent(content);
        post.getTags().addAll(extractTags(content));
        postRepository.save(post);
        return toViews(List.of(post), user).get(0);
    }

    @Transactional
    public PostView reply(String email, Long parentId, String rawContent) {
        User user = findUser(email);
        ForumPost parent = find(parentId);
        if (parent.getStatus() != ForumPostStatus.PUBLISHED) {
            throw new BusinessException("Khong the tra loi bai viet nay", HttpStatus.CONFLICT);
        }
        String content = validateContent(rawContent);
        rateLimiter.check(email);

        ForumPost reply = new ForumPost();
        reply.setAuthor(user);
        reply.setParentId(parent.getId());
        reply.setRootId(parent.getRootId() != null ? parent.getRootId() : parent.getId());
        reply.setContent(content);
        postRepository.save(reply);
        return toViews(List.of(reply), user).get(0);
    }

    @Transactional
    public PostView update(String email, Long id, String rawContent) {
        User user = findUser(email);
        ForumPost post = findOwned(user, id);
        String content = validateContent(rawContent);

        post.setContent(content);
        post.setEditedAt(Instant.now());
        if (post.getParentId() == null) {
            post.getTags().clear();
            post.getTags().addAll(extractTags(content));
        }
        postRepository.save(post);
        return toViews(List.of(post), user).get(0);
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = findUser(email);
        removeOrTombstone(findOwned(user, id));
    }

    @Transactional
    public LikeResult toggleLike(String email, Long id) {
        User user = findUser(email);
        ForumPost post = find(id);
        if (post.getStatus() != ForumPostStatus.PUBLISHED) {
            throw new BusinessException("Bai viet nay khong con hien thi", HttpStatus.NOT_FOUND);
        }

        boolean liked;
        if (likeRepository.existsByPostIdAndUserId(id, user.getId())) {
            likeRepository.deleteByPostIdAndUserId(id, user.getId());
            liked = false;
        } else {
            ForumLike like = new ForumLike();
            like.setPostId(id);
            like.setUserId(user.getId());
            likeRepository.saveAndFlush(like);
            liked = true;
        }
        return new LikeResult(liked, likeRepository.countByPostId(id));
    }

    @Transactional
    public void report(String email, Long id, String reason) {
        User user = findUser(email);
        ForumPost post = find(id);

        if (post.getAuthor().getId().equals(user.getId())) {
            throw new BusinessException("Ban khong the bao cao bai viet cua chinh minh");
        }
        if (post.getStatus() != ForumPostStatus.PUBLISHED) {
            throw new BusinessException("Bai viet nay khong con hien thi", HttpStatus.NOT_FOUND);
        }
        if (reportRepository.existsByPostIdAndReporterId(id, user.getId())) {
            throw new BusinessException("Ban da bao cao bai viet nay roi", HttpStatus.CONFLICT);
        }

        ForumReport report = new ForumReport();
        report.setPostId(id);
        report.setReporterId(user.getId());
        report.setReason(reason == null || reason.isBlank() ? null : reason.trim());
        reportRepository.saveAndFlush(report);

        if (reportRepository.countByPostId(id) >= appProperties.getReportsToAutoHide()) {
            post.setStatus(ForumPostStatus.PENDING_MODERATION);
            postRepository.save(post);
        }
    }

    /** Khi xoa tai khoan: xoa luot thich, bao cao va bai dang (bai co nguoi tra loi thi de lai the "da xoa"). */
    @Transactional
    public void purgeUser(Long userId) {
        likeRepository.deleteByUserId(userId);
        reportRepository.deleteByReporterId(userId);
        for (ForumPost post : postRepository.findByAuthorId(userId)) {
            if (post.getStatus() != ForumPostStatus.DELETED) {
                removeOrTombstone(post);
            }
        }
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<ModerationRow> adminList(String filter) {
        PageRequest top = PageRequest.of(0, 100);
        List<ForumPost> posts = switch (filter) {
            case "REPORTED" -> postRepository.findReported(ForumPostStatus.PUBLISHED, top);
            case "HIDDEN" -> postRepository.findByStatusOrderByCreatedAtDesc(ForumPostStatus.HIDDEN, top);
            default -> postRepository.findByStatusOrderByCreatedAtDesc(ForumPostStatus.PENDING_MODERATION, top);
        };
        return posts.stream().map(this::toModerationRow).toList();
    }

    @Transactional
    public void hide(String adminEmail, Long id, String reason) {
        String cleanReason = reason == null ? "" : reason.trim();
        if (cleanReason.length() < 5) {
            throw new BusinessException("Vui long nhap ly do an (it nhat 5 ky tu)");
        }

        User admin = findUser(adminEmail);
        ForumPost post = find(id);
        if (post.getStatus() == ForumPostStatus.HIDDEN || post.getStatus() == ForumPostStatus.DELETED) {
            throw new BusinessException("Bai viet nay da bi an hoac da bi xoa", HttpStatus.CONFLICT);
        }

        post.setStatus(ForumPostStatus.HIDDEN);
        postRepository.save(post);
        log(post.getId(), admin, ModerationAction.HIDE, cleanReason);
    }

    @Transactional
    public void restore(String adminEmail, Long id, String reason) {
        User admin = findUser(adminEmail);
        ForumPost post = find(id);
        if (post.getStatus() != ForumPostStatus.HIDDEN && post.getStatus() != ForumPostStatus.PENDING_MODERATION
                && post.getStatus() != ForumPostStatus.PUBLISHED) {
            throw new BusinessException("Khong the khoi phuc bai viet da bi xoa", HttpStatus.CONFLICT);
        }

        post.setStatus(ForumPostStatus.PUBLISHED);
        postRepository.save(post);
        reportRepository.deleteByPostId(id);
        log(post.getId(), admin, ModerationAction.RESTORE, reason == null || reason.isBlank() ? null : reason.trim());
    }

    // ---------- noi bo ----------

    private void removeOrTombstone(ForumPost post) {
        if (postRepository.existsByParentId(post.getId())) {
            likeRepository.deleteByPostId(post.getId());
            reportRepository.deleteByPostId(post.getId());
            post.setStatus(ForumPostStatus.DELETED);
            post.setContent("");
            post.getTags().clear();
            postRepository.save(post);
        } else {
            postRepository.delete(post);
        }
    }

    private String validateContent(String raw) {
        String content = raw == null ? "" : raw.trim();
        if (content.isEmpty()) throw new BusinessException("Noi dung khong duoc de trong");
        if (content.length() > MAX_LENGTH) throw new BusinessException("Noi dung toi da " + MAX_LENGTH + " ky tu");
        moderationService.assertClean(content, "Noi dung");
        return content;
    }

    private Set<String> extractTags(String content) {
        Set<String> tags = new LinkedHashSet<>();
        Matcher m = TAG.matcher(content);
        while (m.find()) {
            tags.add(Normalizer.normalize(m.group(1), Normalizer.Form.NFC).toLowerCase(Locale.ROOT));
        }
        if (tags.size() > MAX_TAGS) {
            throw new BusinessException("Toi da " + MAX_TAGS + " chu de (#tag) moi bai");
        }
        return tags;
    }

    private static String normalizeTag(String tag) {
        if (tag == null) return null;
        String t = tag.trim();
        if (t.startsWith("#")) t = t.substring(1);
        if (t.isEmpty()) return null;
        return Normalizer.normalize(t, Normalizer.Form.NFC).toLowerCase(Locale.ROOT);
    }

    private boolean canView(ForumPost post, User viewer) {
        ForumPostStatus s = post.getStatus();
        if (s == ForumPostStatus.PUBLISHED || s == ForumPostStatus.DELETED) return true;
        return post.getAuthor().getId().equals(viewer.getId()) || viewer.getRole() == Role.ADMIN;
    }

    private List<PostView> toViews(List<ForumPost> posts, User viewer) {
        if (posts.isEmpty()) return List.of();

        List<Long> ids = posts.stream().map(ForumPost::getId).toList();
        Map<Long, Long> likes = toMap(likeRepository.countByPostIds(ids));
        Set<Long> liked = new HashSet<>(likeRepository.likedPostIds(viewer.getId(), ids));

        List<Long> rootIds = posts.stream().filter(p -> p.getParentId() == null).map(ForumPost::getId).toList();
        Map<Long, Long> replies = rootIds.isEmpty()
                ? Map.of() : toMap(postRepository.countRepliesByRoot(rootIds, ForumPostStatus.PUBLISHED));

        return posts.stream().map(p -> toView(p, viewer, likes, liked, replies)).toList();
    }

    private PostView toView(ForumPost p, User viewer, Map<Long, Long> likes, Set<Long> liked,
                            Map<Long, Long> replies) {
        boolean deleted = p.getStatus() == ForumPostStatus.DELETED;
        boolean root = p.getParentId() == null;
        User author = p.getAuthor();
        List<String> tags = (root && !deleted) ? new ArrayList<>(p.getTags()) : List.of();

        return new PostView(
                p.getId(), p.getParentId(), root ? p.getId() : p.getRootId(),
                deleted ? null : author.getId(),
                deleted ? "" : author.getFullName(),
                deleted ? null : author.getRole().name(),
                deleted ? null : author.getCohort(),
                deleted ? "" : p.getContent(),
                tags, p.getCreatedAt(), p.getEditedAt() != null,
                likes.getOrDefault(p.getId(), 0L).intValue(), liked.contains(p.getId()),
                replies.getOrDefault(p.getId(), 0L).intValue(),
                author.getId().equals(viewer.getId()),
                p.getStatus().name());
    }

    private ModerationRow toModerationRow(ForumPost p) {
        List<ForumReport> reports = reportRepository.findByPostId(p.getId());
        List<String> reasons = reports.stream()
                .map(ForumReport::getReason)
                .filter(r -> r != null && !r.isBlank())
                .toList();

        List<ModerationRow.HistoryEntry> history = logRepository.findByPostIdOrderByCreatedAtDesc(p.getId()).stream()
                .map(l -> new ModerationRow.HistoryEntry(
                        l.getAction().name(), l.getReason(),
                        userRepository.findById(l.getAdminId()).map(User::getFullName).orElse("?"),
                        l.getCreatedAt()))
                .toList();

        return new ModerationRow(p.getId(), p.getRootId() != null ? p.getRootId() : p.getId(),
                p.getAuthor().getFullName(), p.getContent(), p.getStatus().name(), p.getCreatedAt(),
                reports.size(), reasons, history);
    }

    private void log(Long postId, User admin, ModerationAction action, String reason) {
        ForumModerationLog entry = new ForumModerationLog();
        entry.setPostId(postId);
        entry.setAdminId(admin.getId());
        entry.setAction(action);
        entry.setReason(reason);
        logRepository.save(entry);
    }

    private static Map<Long, Long> toMap(List<Object[]> rows) {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] r : rows) {
            map.put((Long) r[0], ((Number) r[1]).longValue());
        }
        return map;
    }

    private ForumPost find(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay bai viet", HttpStatus.NOT_FOUND));
    }

    private ForumPost findOwned(User user, Long id) {
        ForumPost post = find(id);
        if (post.getStatus() == ForumPostStatus.DELETED) {
            throw new BusinessException("Khong tim thay bai viet", HttpStatus.NOT_FOUND);
        }
        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new BusinessException("Ban khong co quyen thao tac bai viet nay", HttpStatus.FORBIDDEN);
        }
        return post;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung", HttpStatus.UNAUTHORIZED));
    }
}