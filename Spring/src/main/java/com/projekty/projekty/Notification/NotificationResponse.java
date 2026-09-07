package com.projekty.projekty.Notification;

import com.projekty.projekty.User.UserResponse;

import java.time.Instant;
import java.time.ZoneOffset;

public record NotificationResponse(
        Long id,
        Long projectId,
        UserResponse teacher,
        Instant date,
        String message,
        String status,
        boolean isRead
) {
    public static NotificationResponse from(Notification notification) {
        var history = notification.getHistory();

        return new NotificationResponse(
                notification.getId(),
                history != null ? history.getProject().getId() : null,
                history != null ? UserResponse.from(history.getTeacher()) : null,
                history != null
                        ? history.getCreatedAt().toInstant(ZoneOffset.UTC)
                        : notification.getCreatedAt().toInstant(ZoneOffset.UTC),
                history != null ? history.getMessage() : null,
                history != null ? history.getStatus().name().toLowerCase() : null,
                notification.isRead()
        );
    }
}
