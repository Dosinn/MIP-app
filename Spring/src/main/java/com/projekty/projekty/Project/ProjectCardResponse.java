package com.projekty.projekty.Project;

import com.projekty.projekty.Category.Category;
import com.projekty.projekty.Category.CategoryResponse;
import com.projekty.projekty.Team.TeamResponse;

public record ProjectCardResponse(
        Long id,
        String title,
        String description,
        String problem,
        String targetAudience,
        String uniqueness,
        TeamResponse team,
        Double rating,
        String status,
        boolean archived,
        // NLP metrics
        Double problemCohesion,
        Double audiencePrecision,
        Double alignmentScore,
        Double uniquenessScore,
        boolean hasContrastiveMarkers,
        // Category
        CategoryResponse category
) {
    /** Max description length shown on project cards */
    private static final int CARD_DESC_MAX = 400;

    public static ProjectCardResponse from(Project project, TeamResponse team) {
        return from(project, team, null);
    }

    public static ProjectCardResponse from(Project project, TeamResponse team, String status) {
        String desc = project.getDescription();
        if (desc != null && desc.length() > CARD_DESC_MAX) {
            desc = desc.substring(0, CARD_DESC_MAX) + "…";
        }
        CategoryResponse categoryResp = project.getCategory() != null
                ? CategoryResponse.from(project.getCategory())
                : null;

        return new ProjectCardResponse(
                project.getId(),
                project.getTitle(),
                desc,
                project.getProblem(),
                project.getTargetAudience(),
                project.getUniqueness(),
                team,
                project.getRating(),
                status,
                project.isArchived(),
                project.getProblemCohesion(),
                project.getAudiencePrecision(),
                project.getAlignmentScore(),
                project.getUniquenessScore(),
                project.isHasContrastiveMarkers(),
                categoryResp
        );
    }
}
