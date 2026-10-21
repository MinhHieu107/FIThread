package com.FIThread.FIThread.account;

import com.FIThread.FIThread.account.AccountDtos.ReasonRequest;
import com.FIThread.FIThread.account.AccountDtos.UserPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AccountService accountService;

    @GetMapping
    public UserPage list(@RequestParam(required = false) String q,
                         @RequestParam(required = false) String role,
                         @RequestParam(required = false) String status,
                         @RequestParam(defaultValue = "0") int page,
                         @RequestParam(defaultValue = "20") int size) {
        return accountService.list(q, role, status, page, size);
    }

    @PostMapping("/{id}/lock")
    public Map<String, String> lock(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                    Authentication auth) {
        accountService.lock(auth.getName(), id, request.getReason());
        return Map.of("message", "Da khoa tai khoan");
    }

    @PostMapping("/{id}/unlock")
    public Map<String, String> unlock(@PathVariable Long id, Authentication auth) {
        accountService.unlock(auth.getName(), id);
        return Map.of("message", "Da mo khoa tai khoan");
    }

    @PostMapping("/{id}/delete")
    public Map<String, String> delete(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                      Authentication auth) {
        accountService.delete(auth.getName(), id, request.getReason());
        return Map.of("message", "Da xoa tai khoan");
    }
}