package com.projekty.projekty.ProjectReview;

import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Lesson.LessonService;
import com.projekty.projekty.Project.Project;
import com.projekty.projekty.Project.ProjectService;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.Team.TeamResponse;
import com.projekty.projekty.User.User;
import com.projekty.projekty.util.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProjectReviewController {

    private final ProjectReviewActionService projectReviewActionService;
    private final ProjectService projectService;
    private final LessonService lessonService;
    private final TeamMembershipService teamMembershipService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping("/projects/{projectId}/approve")
    public ResponseEntity<Void> approveProject(@PathVariable Long projectId,
            @Valid @RequestBody ReviewDecisionRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = projectService.getProjectById(projectId);

        projectReviewActionService.approveProject(currentUser, project, request.message());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/return")
    public ResponseEntity<Void> returnProject(@PathVariable Long projectId,
            @Valid @RequestBody ReviewDecisionRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = projectService.getProjectById(projectId);

        projectReviewActionService.returnProject(currentUser, project, request.message());
        return ResponseEntity.ok().build();
    }

    // список проектов на проверке для конкретного lesson-слота - для вкладок
    // "Pondelok o 11:00" / "Streda o 10:00"
    @GetMapping("/lessons/{lessonId}/reviews")
    public ResponseEntity<List<ProjectReviewResponse>> getReviewsForLesson(@PathVariable Long lessonId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Lesson lesson = lessonService.getLessonById(lessonId);

        List<ProjectReviewResponse> response = projectReviewActionService.getReviewsForLesson(currentUser, lesson)
                .stream()
                .map(review -> {
                    var team = review.getProject().getTeam();
                    TeamResponse teamResponse = TeamResponse.from(team, teamMembershipService.getMembers(team));
                    return ProjectReviewResponse.from(review, teamResponse);
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reviews/teacher")
    public ResponseEntity<List<ProjectReviewResponse>> getAllTeacherReviews() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<ProjectReviewResponse> response = projectReviewActionService.getAllReviewsForTeacher(currentUser)
                .stream()
                .map(review -> {
                    var team = review.getProject().getTeam();
                    TeamResponse teamResponse = TeamResponse.from(team, teamMembershipService.getMembers(team));
                    return ProjectReviewResponse.from(review, teamResponse);
                })
                .toList();

        return ResponseEntity.ok(response);
    }
}
