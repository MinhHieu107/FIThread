package com.FIThread.FIThread.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendOtpEmail(String toEmail, String fullName, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("FIThread - Ma xac thuc email");
        message.setText("""
                Chao %s,

                Ma xac thuc (OTP) cua ban la: %s

                Ma co hieu luc trong 15 phut. Khong chia se ma nay cho bat ky ai.

                FIThread - Khoa CNTT, Dai hoc Ha Noi
                """.formatted(fullName, otpCode));
        mailSender.send(message);
    }
}