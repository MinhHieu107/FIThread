package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.forum.ForumDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/posts", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PostView create(@Valid @RequestBody PostRequest request, Authentication auth) {
        return forumService.create(auth.getName(), request.getContent(), List.of());
    }

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostView createWithImages(@RequestParam(required = false) String content,
                                     @RequestParam(value = "images", required = false) List<MultipartFile> images,
                                     Authentication auth) {
        return forumService.create(auth.getName(), content, images);
    }

    @GetMapping("/posts/{id}")
    public ThreadView thread(@PathVariable Long id, Authentication auth) {
        return forumService.thread(auth.getName(), id);
    }

    @PostMapping(value = "/posts/{id}/replies", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PostView reply(@PathVariable Long id, @Valid @RequestBody PostRequest request, Authentication auth) {
        return forumService.reply(auth.getName(), id, request.getContent(), List.of());
    }

    @PostMapping(value = "/posts/{id}/replies", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostView replyWithImages(@PathVariable Long id,
                                    @RequestParam(required = false) String content,
                                    @RequestParam(value = "images", required = false) List<MultipartFile> images,
                                    Authentication auth) {
        return forumService.reply(auth.getName(), id, content, images);
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

    @GetMapping("/images/{id}")
    public ResponseEntity<Resource> image(@PathVariable Long id, Authentication auth) {
        ForumService.ImageFile file = forumService.loadImage(auth.getName(), id);
        return ResponseEntity.ok()
                .contentType(file.mediaType())
                .header("Cache-Control", "private, max-age=86400")
                .body(file.resource());
    }
}