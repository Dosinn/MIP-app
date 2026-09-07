package com.projekty.projekty.User;

import jakarta.validation.constraints.NotBlank;

public record OnboardingRequest(
        @NotBlank String name,
        Long teacherId
) {}
