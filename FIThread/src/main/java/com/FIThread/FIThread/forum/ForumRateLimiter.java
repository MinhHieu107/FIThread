package com.FIThread.FIThread.forum;

import com.FIThread.FIThread.common.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

@Component
public class ForumRateLimiter {

    private static final int MAX_PER_WINDOW = 15;
    private static final Duration WINDOW = Duration.ofMinutes(5);

    private final Map<String, Deque<Instant>> perUser = new HashMap<>();

    public synchronized void check(String userKey) {
        Instant now = Instant.now();
        Deque<Instant> times = perUser.computeIfAbsent(userKey, k -> new ArrayDeque<>());
        while (!times.isEmpty() && times.peekFirst().isBefore(now.minus(WINDOW))) {
            times.pollFirst();
        }
        if (times.size() >= MAX_PER_WINDOW) {
            throw new BusinessException(
                    "Ban dang dang bai qua nhanh, vui long thu lai sau it phut", HttpStatus.TOO_MANY_REQUESTS);
        }
        times.addLast(now);
    }
}