package com.projekty.projekty.Project;

import com.projekty.projekty.Category.CategoryResponse;
import com.projekty.projekty.Team.TeamResponse;

import java.util.List;

public record ProjectResponse(
        Long id,
        String title,
        String description,
        String problem,
        String targetAudience,
        String uniqueness,
        TeamResponse team,
        Double rating,
        List<ProjectSectionFilesResponse> files,
        List<ProjectCardResponse> improves,
        String status,
        ProjectCardResponse improvedFrom,
        boolean archived,
        // NLP metrics
        Double problemCohesion,
        Double audiencePrecision,
        Double alignmentScore,
        Double uniquenessScore,
        boolean hasContrastiveMarkers,
        // Category
        CategoryResponse category
) {}
