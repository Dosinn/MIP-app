package com.projekty.projekty.CustomException;

import java.time.LocalDateTime;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String errorCode,
        String message
) {}
