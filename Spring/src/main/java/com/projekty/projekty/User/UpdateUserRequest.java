package com.projekty.projekty.User;

public record UpdateUserRequest(
        String name,
        String email,
        String role,
        Boolean isTeacher
) {}

