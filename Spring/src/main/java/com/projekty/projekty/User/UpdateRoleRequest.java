package com.projekty.projekty.User;

import jakarta.validation.constraints.NotBlank;

public record UpdateRoleRequest(
        @NotBlank String role
) {}
