package com.projekty.projekty.ProjectSection;

import java.time.LocalDateTime;

public record ProjectSectionResponse(
        Long id,
        String name,
        String description,
        int orderIndex,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        boolean locked
) {
    public static ProjectSectionResponse from(ProjectSection section) {
        return new ProjectSectionResponse(
                section.getId(),
                section.getName(),
                section.getDescription(),
                section.getOrderIndex(),
                section.getStartsAt(),
                section.getEndsAt(),
                section.isLocked()
        );
    }
}
