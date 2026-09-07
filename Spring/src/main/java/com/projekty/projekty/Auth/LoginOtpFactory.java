package com.projekty.projekty.Auth;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Component
public class LoginOtpFactory {

    private static final int EXPIRATION_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    public LoginOtp create(String email) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        return LoginOtp.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES))
                .used(false)
                .build();
    }
}
