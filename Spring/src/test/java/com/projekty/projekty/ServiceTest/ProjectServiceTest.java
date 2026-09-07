package com.projekty.projekty.ServiceTest;

import com.projekty.projekty.Category.CategoryRepository;
import com.projekty.projekty.CustomException.TeacherMismatchException;
import com.projekty.projekty.CustomException.TeamAlreadyHasProjectException;
import com.projekty.projekty.Lesson.Lesson;
import com.projekty.projekty.Lesson.LessonService;
import com.projekty.projekty.Project.*;
import com.projekty.projekty.ProjectReview.ProjectReview;
import com.projekty.projekty.ProjectReview.ProjectReviewFactory;
import com.projekty.projekty.ProjectReview.ProjectReviewRepository;
import com.projekty.projekty.Team.Team;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.Team.TeamService;
import com.projekty.projekty.User.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectFactory projectFactory;

    @Mock
    private TeamService teamService;

    @Mock
    private TeamMembershipService teamMembershipService;

    @Mock
    private LessonService lessonService;

    @Mock
    private ProjectReviewRepository projectReviewRepository;

    @Mock
    private ProjectReviewFactory projectReviewFactory;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void shouldCreateProjectWhenLessonBelongsToCreatorsTeacher() {
        User teacher = User.builder().id(10L).build();
        User creator = User.builder().id(1L).teacher(teacher).build();
        Team team = Team.builder().id(1L).build();
        Lesson lesson = Lesson.builder().id(5L).teacher(teacher).build();
        Project expectedProject = Project.builder().id(1L).title("My Project").team(team).build();
        ProjectReview review = ProjectReview.builder().project(expectedProject).lesson(lesson).build();

        when(teamService.getOrCreateMyTeam(creator)).thenReturn(team);
        when(projectRepository.findByTeam(team)).thenReturn(Optional.empty());
        when(lessonService.getLessonById(5L)).thenReturn(lesson);
        when(projectFactory.create(
                "My Project", "desc", null, null, null,
                team, null, null,
                null, null, null, null, null
        )).thenReturn(expectedProject);
        when(projectRepository.save(expectedProject)).thenReturn(expectedProject);
        when(projectReviewFactory.create(expectedProject, lesson)).thenReturn(review);

        Project result = projectService.createProject(
                creator, "My Project", "desc",
                null, null, null,
                5L, null, null,
                null, null, null, null, null
        );

        assertThat(result).isEqualTo(expectedProject);
    }

    @Test
    void shouldThrowExceptionWhenLessonBelongsToDifferentTeacher() {
        User myTeacher = User.builder().id(10L).build();
        User otherTeacher = User.builder().id(20L).build();
        User creator = User.builder().id(1L).teacher(myTeacher).build();
        Team team = Team.builder().id(1L).build();
        Lesson lesson = Lesson.builder().id(5L).teacher(otherTeacher).build();

        when(teamService.getOrCreateMyTeam(creator)).thenReturn(team);
        when(projectRepository.findByTeam(team)).thenReturn(Optional.empty());
        when(lessonService.getLessonById(5L)).thenReturn(lesson);

        assertThatThrownBy(() -> projectService.createProject(
                creator, "Title", "desc",
                null, null, null,
                5L, null, null,
                null, null, null, null, null
        )).isInstanceOf(TeacherMismatchException.class);
    }

    @Test
    void shouldThrowExceptionWhenTeamAlreadyHasProject() {
        User creator = User.builder().id(1L).build();
        Team team = Team.builder().id(1L).build();
        Project existingProject = Project.builder().id(99L).build();

        when(teamService.getOrCreateMyTeam(creator)).thenReturn(team);
        when(projectRepository.findByTeam(team)).thenReturn(Optional.of(existingProject));

        assertThatThrownBy(() -> projectService.createProject(
                creator, "Title", "desc",
                null, null, null,
                5L, null, null,
                null, null, null, null, null
        )).isInstanceOf(TeamAlreadyHasProjectException.class);
    }
}
