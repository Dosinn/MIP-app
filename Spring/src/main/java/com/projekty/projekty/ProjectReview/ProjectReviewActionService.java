package com.projekty.projekty.ProjectReview;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.CustomException.ProjectReviewNotFoundException;
import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Notification.NotificationFactory;
import com.projekty.projekty.Notification.NotificationRepository;
import com.projekty.projekty.Project.Project;
import com.projekty.projekty.ProjectHistory.HistoryStatus;
import com.projekty.projekty.ProjectHistory.ProjectHistory;
import com.projekty.projekty.ProjectHistory.ProjectHistoryFactory;
import com.projekty.projekty.ProjectHistory.ProjectHistoryRepository;
import com.projekty.projekty.Team.TeamMembership;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectReviewActionService {

    private final ProjectReviewRepository projectReviewRepository;
    private final ProjectHistoryFactory projectHistoryFactory;
    private final ProjectHistoryRepository projectHistoryRepository;
    private final NotificationFactory notificationFactory;
    private final NotificationRepository notificationRepository;
    private final TeamMembershipService teamMembershipService;

    public ProjectReview approveProject(User teacher, Project project, String message) {
        return decideReview(teacher, project, HistoryStatus.APPROVED, message);
    }

    public ProjectReview returnProject(User teacher, Project project, String message) {
        return decideReview(teacher, project, HistoryStatus.RETURNED_BY_TEACHER, message);
    }

    private ProjectReview decideReview(User teacher, Project project, HistoryStatus decision, String message) {
        ProjectReview review = projectReviewRepository.findByProject(project)
                .orElseThrow(() -> new ProjectReviewNotFoundException("This project has no review yet"));

        assertCanReview(teacher, review);

        review.setStatus(decision == HistoryStatus.APPROVED ? ReviewStatus.APPROVED : ReviewStatus.RETURNED_BY_TEACHER);
        projectReviewRepository.save(review);

        ProjectHistory history = projectHistoryFactory.create(project, teacher, decision, message);
        history = projectHistoryRepository.save(history);

        notifyTeamMembers(project, history);

        return review;
    }

    private void notifyTeamMembers(Project project, ProjectHistory history) {
        for (TeamMembership membership : teamMembershipService.getMembers(project.getTeam())) {
            notificationRepository.save(notificationFactory.create(membership.getUser(), history));
        }
    }

    public List<ProjectReview> getReviewsForLesson(User currentUser, Lesson lesson) {
        boolean isAdmin = currentUser.getUserRole() == UserRole.ADMIN;
        boolean isLessonOwner = currentUser.getUserRole() == UserRole.TEACHER
                && lesson.getTeacher().getId().equals(currentUser.getId());

        if (!isAdmin && !isLessonOwner) {
            throw new AccessForbiddenException("Only the teacher of this lesson can view its reviews");
        }

        return projectReviewRepository.findByLesson(lesson).stream()
                .sorted(java.util.Comparator.comparingInt(this::getReviewStatusPriority))
                .toList();
    }

    public List<ProjectReview> getAllReviewsForTeacher(User currentUser) {
        List<ProjectReview> reviews = currentUser.getUserRole() == UserRole.ADMIN
                ? projectReviewRepository.findAllActive()
                : projectReviewRepository.findAllByTeacher(currentUser);
        return reviews.stream()
                .sorted(java.util.Comparator.comparingInt(this::getReviewStatusPriority))
                .toList();
    }

    private int getReviewStatusPriority(ProjectReview review) {
        if (review.getStatus() == ReviewStatus.PENDING) return 0;
        if (review.getStatus() == ReviewStatus.RETURNED_BY_TEACHER) return 1;
        if (review.getStatus() == ReviewStatus.APPROVED) return 3;
        return 4;
    }

    private void assertCanReview(User teacher, ProjectReview review) {
        boolean isAdmin = teacher.getUserRole() == UserRole.ADMIN;
        boolean isLessonOwner = teacher.getUserRole() == UserRole.TEACHER
                && review.getLesson().getTeacher().getId().equals(teacher.getId());

        if (!isAdmin && !isLessonOwner) {
            throw new AccessForbiddenException("Only the teacher of this lesson can review this project");
        }
    }
}
