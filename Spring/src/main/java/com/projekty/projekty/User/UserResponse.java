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
                cleanEmail(user.getEmail()),
                user.getUserRole().name().toLowerCase(),
                user.getTeacher() != null ? user.getTeacher().getId() : null,
                user.isOnboarded(),
                user.getUserRole() == UserRole.TEACHER || (user.getUserRole() == UserRole.ADMIN && user.isTeacher())
        );
    }

    public static String cleanEmail(String email) {
        if (email == null) return null;
        return email
                .replaceAll("(?i)^archived_\\d*_*", "")
                .replaceAll("(?i)\\.202\\d(\\.\\d+)?(?=@)", "")
                .replaceAll("(?i)\\.(past|archived)(?=@)", "");
    }
}

