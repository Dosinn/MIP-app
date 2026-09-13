package com.projekty.projekty.User;

import org.springframework.stereotype.Component;

@Component
public class UserFactory {



    public User createFromGoogle(String email, String name) {
        return User.builder()
                .email(email)
                .name(name != null ? name : "")
                .userRole(UserRole.STUDENT)
                .onboarded(false)
                .build();
    }
}
