package com.FIThread.FIThread.user;

import com.FIThread.FIThread.auth.dto.RegisterRequest;
import com.FIThread.FIThread.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email nay da duoc dang ky", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCohort(request.getCohort());
        user.setRole(Role.STUDENT);
        user.setStatus(UserStatus.PENDING_EMAIL);

        return userRepository.save(user);
    }
}