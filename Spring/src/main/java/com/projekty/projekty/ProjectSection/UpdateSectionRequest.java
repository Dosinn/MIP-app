package com.projekty.projekty.ProjectSection;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record UpdateSectionRequest(
        @NotBlank String name,
        String description,
        int orderIndex,
        LocalDateTime startsAt,
        LocalDateTime endsAt
) {}
