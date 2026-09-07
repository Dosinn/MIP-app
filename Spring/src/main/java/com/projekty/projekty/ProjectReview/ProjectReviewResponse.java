package com.projekty.projekty.ProjectReview;

import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Team.TeamResponse;

public record ProjectReviewResponse(
        Long id,
        String title,
        String description,
        TeamResponse team,
        Double rating,
        String reviewStatus,
        Long lessonId,
        Integer lessonDayOfWeek,
        Integer lessonHour,
        String lessonRoom,
        Long improvesProjectId,
        String improvesProjectTitle
) {
    public static ProjectReviewResponse from(ProjectReview review, TeamResponse team) {
        Lesson lesson = review.getLesson();
        var improves = review.getProject().getImprovesProject();
        return new ProjectReviewResponse(
                review.getProject().getId(),
                review.getProject().getTitle(),
                review.getProject().getDescription(),
                team,
                review.getProject().getRating(),
                review.getStatus().name().toLowerCase(),
                lesson != null ? lesson.getId() : null,
                lesson != null ? lesson.getDayOfWeek() : null,
                lesson != null ? lesson.getHour() : null,
                lesson != null ? lesson.getRoom() : null,
                improves != null ? improves.getId() : null,
                improves != null ? improves.getTitle() : null
        );
    }
}
