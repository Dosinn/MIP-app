package com.projekty.projekty.ProjectHistory;

import com.projekty.projekty.User.UserResponse;

import java.time.Instant;
import java.time.ZoneOffset;

public record ProjectHistoryResponse(
        Long id,
        Long projectId,
        UserResponse teacher,
        Instant date,
        String message,
        String status,
        String descriptionSnapshot,
        String titleSnapshot
) {
    public static ProjectHistoryResponse from(ProjectHistory history) {
        return new ProjectHistoryResponse(
                history.getId(),
                history.getProject().getId(),
                UserResponse.from(history.getTeacher()),
                history.getCreatedAt().toInstant(ZoneOffset.UTC),
                history.getMessage(),
                history.getStatus().name().toLowerCase(),
                history.getDescriptionSnapshot(),
                history.getTitleSnapshot()
        );
    }
}
