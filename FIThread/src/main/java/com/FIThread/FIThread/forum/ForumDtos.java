package com.FIThread.FIThread.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

public final class ForumDtos {

    private ForumDtos() {}

    public record PostPage(List<PostView> content, int page, int totalPages, long totalElements) {}

    public record ThreadView(PostView root, List<PostView> replies) {}
    public record FeaturedThread(
            PostView root,
            PostView featuredComment
    ) {}
    public record LikeResult(boolean liked, long likeCount) {}

    public record TagCount(String tag, long count) {}

    public record PostView(Long id, Long parentId, Long rootId, Long authorId, String authorName,
                           String authorRole, String authorCohort, String content, List<String> tags,
                           Instant createdAt, boolean edited, int likeCount, boolean likedByMe,
                           int replyCount, boolean mine, String status, List<Long> imageIds) {}
    public record ModerationRow(Long id, Long rootId, String authorName, String content, String status,
                                Instant createdAt, int reportCount, List<String> reasons,
                                List<HistoryEntry> history, List<Long> imageIds) {
        public record HistoryEntry(String action, String reason, String adminName, Instant createdAt) {}
    }

    @Getter
    @Setter
    public static class PostRequest {
        @NotBlank(message = "Noi dung khong duoc de trong")
        @Size(max = 2000, message = "Noi dung qua dai")
        private String content;
    }

    @Getter
    @Setter
    public static class ReasonRequest {
        @Size(max = 500, message = "Ly do toi da 500 ky tu")
        private String reason;
    }
}