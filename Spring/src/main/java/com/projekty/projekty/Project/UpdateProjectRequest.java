package com.projekty.projekty.Project;

import jakarta.validation.constraints.NotBlank;

public record UpdateProjectRequest(
        @NotBlank String title,
        @NotBlank String description,

        // Three dedicated text fields (optional — null means no change)
        String problem,
        String targetAudience,
        String uniqueness,

        // NLP metrics updated after re-analysis
        Double problemCohesion,
        Double audiencePrecision,
        Double alignmentScore,
        Double uniquenessScore,
        Boolean hasContrastiveMarkers,

        // User-selected category
        Long categoryId
) {}
