package com.projekty.projekty.Auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyCodeRequest(
        @NotBlank String email,
        @NotBlank String code
) {}
