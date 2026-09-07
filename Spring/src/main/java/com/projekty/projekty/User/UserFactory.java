package com.projekty.projekty.User;

import org.springframework.stereotype.Component;

@Component
public class UserFactory {

    public User createUnregistered(String email) {
        return User.builder()
                .email(email)
                .name("")
                .userRole(UserRole.STUDENT)
                .onboarded(false)
                .build();
    }
}
