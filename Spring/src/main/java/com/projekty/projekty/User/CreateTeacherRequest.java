package com.projekty.projekty.User;

import jakarta.validation.constraints.NotBlank;

public record CreateTeacherRequest(
        @NotBlank String name,
        @NotBlank String email
) {}
