package com.projekty.projekty.Auth;

import com.projekty.projekty.User.UserResponse;

public record LoginResponse(
        String token,
        UserResponse user
) {}
