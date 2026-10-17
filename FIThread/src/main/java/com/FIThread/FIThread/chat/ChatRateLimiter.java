package com.FIThread.FIThread.chat;

import com.FIThread.FIThread.common.exception.BusinessException;
import com.FIThread.FIThread.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatRateLimiter {

    private final AppProperties appProperties;

    private final Map<String, Deque<Instant>> perUser = new HashMap<>();
    private final Deque<Instant> global = new ArrayDeque<>();

    public synchronized void check(String userKey) {
        Instant now = Instant.now();
        AppProperties.Chat chat = appProperties.getChat();

        purge(global, now.minus(Duration.ofMinutes(1)));
        if (global.size() >= chat.getGlobalPerMinute()) {
            throw new BusinessException(
                    "Chatbot dang co qua nhieu nguoi hoi, vui long thu lai sau it phut", HttpStatus.TOO_MANY_REQUESTS);
        }

        Deque<Instant> mine = perUser.computeIfAbsent(userKey, k -> new ArrayDeque<>());
        purge(mine, now.minus(Duration.ofHours(1)));
        if (mine.size() >= chat.getMaxPerHour()) {
            throw new BusinessException(
                    "Ban da hoi qua nhieu trong 1 gio, vui long quay lai sau", HttpStatus.TOO_MANY_REQUESTS);
        }

        global.addLast(now);
        mine.addLast(now);
    }

    private static void purge(Deque<Instant> deque, Instant cutoff) {
        while (!deque.isEmpty() && deque.peekFirst().isBefore(cutoff)) {
            deque.pollFirst();
        }
    }
}