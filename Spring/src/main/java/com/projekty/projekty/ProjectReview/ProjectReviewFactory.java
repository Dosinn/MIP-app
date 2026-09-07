package com.projekty.projekty.ProjectReview;

import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Project.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectReviewFactory {

    public ProjectReview create(Project project, Lesson lesson) {
        return ProjectReview.builder()
                .project(project)
                .lesson(lesson)
                .status(ReviewStatus.PENDING)
                .build();
    }
}
