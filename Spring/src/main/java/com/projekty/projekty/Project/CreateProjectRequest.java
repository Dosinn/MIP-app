package com.projekty.projekty.Project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateProjectRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull Long lessonId,
        Long improvesProjectId,

        // Three dedicated NLP-analysed text fields
        String problem,
        String targetAudience,
        String uniqueness,

        // NLP quality metrics from Python (optional on creation, populated after analysis)
        Double problemCohesion,
        Double audiencePrecision,
        Double alignmentScore,
        Double uniquenessScore,
        Boolean hasContrastiveMarkers,

        // User-selected category ID
        Long categoryId
) {}
