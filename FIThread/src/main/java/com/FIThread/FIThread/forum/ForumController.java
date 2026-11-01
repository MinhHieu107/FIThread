package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.forum.ForumDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/posts")
    public PostPage feed(@RequestParam(required = false) String tag,
                         @RequestParam(required = false) String q,
                         @RequestParam(defaultValue = "false") boolean mine,
                         @RequestParam(defaultValue = "0") int page,
                         @RequestParam(defaultValue = "20") int size,
                         Authentication auth) {
        return forumService.feed(auth.getName(), tag, q, mine, page, size);
    }
    @GetMapping("/posts/featured")
    public List<FeaturedThread> featured(
            @RequestParam(defaultValue = "5") int size,
            Authentication auth
    ) {
        return forumService.featuredThreads(auth.getName(), size);
    }
    @PostMapping("/posts")
    public PostView create(@Valid @RequestBody PostRequest request, Authentication auth) {
        return forumService.create(auth.getName(), request.getContent());
    }

    @GetMapping("/posts/{id}")
    public ThreadView thread(@PathVariable Long id, Authentication auth) {
        return forumService.thread(auth.getName(), id);
    }

    @PostMapping("/posts/{id}/replies")
    public PostView reply(@PathVariable Long id, @Valid @RequestBody PostRequest request, Authentication auth) {
        return forumService.reply(auth.getName(), id, request.getContent());
    }

    @PutMapping("/posts/{id}")
    public PostView update(@PathVariable Long id, @Valid @RequestBody PostRequest request, Authentication auth) {
        return forumService.update(auth.getName(), id, request.getContent());
    }

    @DeleteMapping("/posts/{id}")
    public Map<String, String> delete(@PathVariable Long id, Authentication auth) {
        forumService.delete(auth.getName(), id);
        return Map.of("message", "Da xoa bai viet");
    }

    @PostMapping("/posts/{id}/like")
    public LikeResult like(@PathVariable Long id, Authentication auth) {
        return forumService.toggleLike(auth.getName(), id);
    }

    @PostMapping("/posts/{id}/report")
    public Map<String, String> report(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                      Authentication auth) {
        forumService.report(auth.getName(), id, request.getReason());
        return Map.of("message", "Da gui bao cao");
    }

    @GetMapping("/tags/trending")
    public List<TagCount> trending() {
        return forumService.trendingTags();
    }
}