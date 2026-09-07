package com.projekty.projekty.ServiceTest;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Notification.NotificationFactory;
import com.projekty.projekty.Notification.NotificationRepository;
import com.projekty.projekty.Project.Project;
import com.projekty.projekty.ProjectHistory.HistoryStatus;
import com.projekty.projekty.ProjectHistory.ProjectHistory;
import com.projekty.projekty.ProjectHistory.ProjectHistoryFactory;
import com.projekty.projekty.ProjectHistory.ProjectHistoryRepository;
import com.projekty.projekty.ProjectReview.*;
import com.projekty.projekty.Team.Team;
import com.projekty.projekty.Team.TeamMembership;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProjectReviewActionServiceTest {

    @Mock
    private ProjectReviewRepository projectReviewRepository;

    @Mock
    private ProjectHistoryFactory projectHistoryFactory;

    @Mock
    private ProjectHistoryRepository projectHistoryRepository;

    @Mock
    private NotificationFactory notificationFactory;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private TeamMembershipService teamMembershipService;

    @InjectMocks
    private ProjectReviewActionService projectReviewActionService;

    @Test
    void shouldApproveAndNotifyAllTeamMembers() {
        User teacher = User.builder().id(10L).userRole(UserRole.TEACHER).build();
        Lesson lesson = Lesson.builder().id(1L).teacher(teacher).build();
        Team team = Team.builder().id(1L).build();
        Project project = Project.builder().id(1L).team(team).build();
        ProjectReview review = ProjectReview.builder().project(project).lesson(lesson).status(ReviewStatus.PENDING).build();
        ProjectHistory history = ProjectHistory.builder().id(1L).project(project).teacher(teacher)
                .status(HistoryStatus.APPROVED).build();

        User member1 = User.builder().id(2L).build();
        User member2 = User.builder().id(3L).build();
        List<TeamMembership> members = List.of(
                TeamMembership.builder().user(member1).build(),
                TeamMembership.builder().user(member2).build()
        );

        when(projectReviewRepository.findByProject(project)).thenReturn(Optional.of(review));
        when(projectReviewRepository.save(review)).thenReturn(review);
        when(projectHistoryFactory.create(project, teacher, HistoryStatus.APPROVED, "Good job")).thenReturn(history);
        when(projectHistoryRepository.save(history)).thenReturn(history);
        when(teamMembershipService.getMembers(team)).thenReturn(members);

        ProjectReview result = projectReviewActionService.approveProject(teacher, project, "Good job");

        assertThat(result.getStatus()).isEqualTo(ReviewStatus.APPROVED);
        verify(notificationRepository, times(2)).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void shouldThrowExceptionWhenTeacherDoesNotOwnLesson() {
        User lessonOwner = User.builder().id(10L).userRole(UserRole.TEACHER).build();
        User otherTeacher = User.builder().id(20L).userRole(UserRole.TEACHER).build();
        Lesson lesson = Lesson.builder().id(1L).teacher(lessonOwner).build();
        Project project = Project.builder().id(1L).build();
        ProjectReview review = ProjectReview.builder().project(project).lesson(lesson).status(ReviewStatus.PENDING).build();

        when(projectReviewRepository.findByProject(project)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> projectReviewActionService.approveProject(otherTeacher, project, "msg"))
                .isInstanceOf(AccessForbiddenException.class);
    }

    @Test
    void shouldAllowAdminToReviewAnyProject() {
        User teacher = User.builder().id(10L).userRole(UserRole.TEACHER).build();
        User admin = User.builder().id(99L).userRole(UserRole.ADMIN).build();
        Lesson lesson = Lesson.builder().id(1L).teacher(teacher).build();
        Team team = Team.builder().id(1L).build();
        Project project = Project.builder().id(1L).team(team).build();
        ProjectReview review = ProjectReview.builder().project(project).lesson(lesson).status(ReviewStatus.PENDING).build();
        ProjectHistory history = ProjectHistory.builder().id(1L).build();

        when(projectReviewRepository.findByProject(project)).thenReturn(Optional.of(review));
        when(projectReviewRepository.save(review)).thenReturn(review);
        when(projectHistoryFactory.create(project, admin, HistoryStatus.RETURNED_BY_TEACHER, "Needs work"))
                .thenReturn(history);
        when(projectHistoryRepository.save(history)).thenReturn(history);
        when(teamMembershipService.getMembers(team)).thenReturn(List.of());

        ProjectReview result = projectReviewActionService.returnProject(admin, project, "Needs work");

        assertThat(result.getStatus()).isEqualTo(ReviewStatus.RETURNED_BY_TEACHER);
    }
}
