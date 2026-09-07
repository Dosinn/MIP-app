package com.projekty.projekty.ProjectSection;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record UpdateSectionWindowRequest(
        @NotNull LocalDateTime startsAt,
        @NotNull LocalDateTime endsAt
) {}
