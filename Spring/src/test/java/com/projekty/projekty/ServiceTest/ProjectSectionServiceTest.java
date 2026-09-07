package com.projekty.projekty.ServiceTest;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.ProjectSection.*;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
public class ProjectSectionServiceTest {

    @Mock
    private ProjectSectionRepository projectSectionRepository;

    @Mock
    private ProjectSectionFactory projectSectionFactory;

    @InjectMocks
    private ProjectSectionService projectSectionService;

    @Test
    void shouldBeOpenWhenWithinWindowAndNotLocked() {
        ProjectSection section = ProjectSection.builder()
                .startsAt(LocalDateTime.now().minusDays(1))
                .endsAt(LocalDateTime.now().plusDays(1))
                .locked(false)
                .build();

        assertThat(projectSectionService.isOpenForSubmission(section)).isTrue();
    }

    @Test
    void shouldBeClosedWhenBeforeStartDate() {
        ProjectSection section = ProjectSection.builder()
                .startsAt(LocalDateTime.now().plusDays(1))
                .endsAt(LocalDateTime.now().plusDays(2))
                .locked(false)
                .build();

        assertThat(projectSectionService.isOpenForSubmission(section)).isFalse();
    }

    @Test
    void shouldBeClosedWhenAfterEndDate() {
        ProjectSection section = ProjectSection.builder()
                .startsAt(LocalDateTime.now().minusDays(2))
                .endsAt(LocalDateTime.now().minusDays(1))
                .locked(false)
                .build();

        assertThat(projectSectionService.isOpenForSubmission(section)).isFalse();
    }

    @Test
    void shouldBeClosedWhenManuallyLockedEvenIfWithinWindow() {
        ProjectSection section = ProjectSection.builder()
                .startsAt(LocalDateTime.now().minusDays(1))
                .endsAt(LocalDateTime.now().plusDays(1))
                .locked(true)
                .build();

        assertThat(projectSectionService.isOpenForSubmission(section)).isFalse();
    }

    @Test
    void shouldThrowExceptionWhenNonAdminTriesToCreateSection() {
        User student = User.builder().id(1L).userRole(UserRole.STUDENT).build();

        assertThatThrownBy(() -> projectSectionService.createSection(
                student, "scope", "desc", 0, LocalDateTime.now(), LocalDateTime.now().plusDays(7)
        )).isInstanceOf(AccessForbiddenException.class);
    }
}
