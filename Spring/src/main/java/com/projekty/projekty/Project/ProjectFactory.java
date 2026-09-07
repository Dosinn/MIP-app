package com.projekty.projekty.Project;

import com.projekty.projekty.Category.Category;
import com.projekty.projekty.Team.Team;
import org.springframework.stereotype.Component;

@Component
public class ProjectFactory {

    public Project create(
            String title,
            String description,
            String problem,
            String targetAudience,
            String uniqueness,
            Team team,
            Project improvesProject,
            Category category,
            Double problemCohesion,
            Double audiencePrecision,
            Double alignmentScore,
            Double uniquenessScore,
            Boolean hasContrastiveMarkers
    ) {
        return Project.builder()
                .title(title)
                .description(description)
                .problem(problem)
                .targetAudience(targetAudience)
                .uniqueness(uniqueness)
                .team(team)
                .improvesProject(improvesProject)
                .category(category)
                .rating(null)
                .problemCohesion(problemCohesion)
                .audiencePrecision(audiencePrecision)
                .alignmentScore(alignmentScore)
                .uniquenessScore(uniquenessScore)
                .hasContrastiveMarkers(hasContrastiveMarkers != null && hasContrastiveMarkers)
                .build();
    }
}
