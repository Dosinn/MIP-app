package com.projekty.projekty.User;

public record UserResponse(
        Long id,
        String name,
        String email,
        String role,
        Long teacherId,
        boolean onboarded,
        boolean isTeacher
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getUserRole().name().toLowerCase(),
                user.getTeacher() != null ? user.getTeacher().getId() : null,
                user.isOnboarded(),
                user.getUserRole() == UserRole.TEACHER || (user.getUserRole() == UserRole.ADMIN && user.isTeacher())
        );
    }
}

