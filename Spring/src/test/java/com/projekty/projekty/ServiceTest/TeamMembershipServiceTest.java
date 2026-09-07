package com.projekty.projekty.ServiceTest;

import com.projekty.projekty.CustomException.TeacherMismatchException;
import com.projekty.projekty.CustomException.TeamFullException;
import com.projekty.projekty.CustomException.UserAlreadyInTeamException;
import com.projekty.projekty.Team.*;
import com.projekty.projekty.User.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TeamMembershipServiceTest {

    @Mock
    private TeamMembershipRepository teamMembershipRepository;

    @Mock
    private TeamMembershipFactory teamMembershipFactory;

    @InjectMocks
    private TeamMembershipService teamMembershipService;

    @Test
    void shouldAddFirstMemberWithoutTeacherCheck() {
        Team team = Team.builder().id(1L).build();
        User user = User.builder().id(1L).build();
        TeamMembership membership = TeamMembership.builder().team(team).user(user).build();

        when(teamMembershipRepository.findByUser(user)).thenReturn(Optional.empty());
        when(teamMembershipRepository.findByTeam(team)).thenReturn(List.of());
        when(teamMembershipFactory.create(team, user)).thenReturn(membership);
        when(teamMembershipRepository.save(membership)).thenReturn(membership);

        TeamMembership result = teamMembershipService.addMember(team, user);

        assertThat(result).isEqualTo(membership);
    }

    @Test
    void shouldAttachExistingNullTeamMembershipToNewTeam() {
        Team team = Team.builder().id(1L).build();
        User user = User.builder().id(1L).build();
        TeamMembership existingMembership = TeamMembership.builder().id(10L).user(user).team(null).build();

        when(teamMembershipRepository.findByUser(user)).thenReturn(Optional.of(existingMembership));
        when(teamMembershipRepository.findByTeam(team)).thenReturn(List.of());
        when(teamMembershipRepository.save(existingMembership)).thenReturn(existingMembership);

        TeamMembership result = teamMembershipService.addMember(team, user);

        assertThat(result.getTeam()).isEqualTo(team);
        assertThat(existingMembership.getTeam()).isEqualTo(team);
    }

    @Test
    void shouldThrowExceptionWhenUserAlreadyInTeam() {
        Team team = Team.builder().id(1L).build();
        User user = User.builder().id(1L).build();

        when(teamMembershipRepository.findByUser(user)).thenReturn(Optional.of(TeamMembership.builder().id(11L).user(user).team(team).build()));

        assertThatThrownBy(() -> teamMembershipService.addMember(team, user))
                .isInstanceOf(UserAlreadyInTeamException.class);
    }

    @Test
    void shouldThrowExceptionWhenTeacherDoesNotMatchExistingMembers() {
        Team team = Team.builder().id(1L).build();
        User teacherA = User.builder().id(100L).build();
        User teacherB = User.builder().id(200L).build();

        User existingMemberUser = User.builder().id(2L).teacher(teacherA).build();
        User newUser = User.builder().id(3L).teacher(teacherB).build();

        List<TeamMembership> existingMembers = List.of(
                TeamMembership.builder().id(1L).user(existingMemberUser).build()
        );

        when(teamMembershipRepository.findByUser(newUser)).thenReturn(Optional.empty());
        when(teamMembershipRepository.findByTeam(team)).thenReturn(existingMembers);

        assertThatThrownBy(() -> teamMembershipService.addMember(team, newUser))
                .isInstanceOf(TeacherMismatchException.class);
    }

    @Test
    void shouldAddMemberWhenTeacherMatchesExistingMembers() {
        Team team = Team.builder().id(1L).build();
        User sharedTeacher = User.builder().id(100L).build();

        User existingMemberUser = User.builder().id(2L).teacher(sharedTeacher).build();
        User newUser = User.builder().id(3L).teacher(sharedTeacher).build();

        List<TeamMembership> existingMembers = List.of(
                TeamMembership.builder().id(1L).user(existingMemberUser).build()
        );
        TeamMembership newMembership = TeamMembership.builder().team(team).user(newUser).build();

        when(teamMembershipRepository.findByUser(newUser)).thenReturn(Optional.empty());
        when(teamMembershipRepository.findByTeam(team)).thenReturn(existingMembers);
        when(teamMembershipFactory.create(team, newUser)).thenReturn(newMembership);
        when(teamMembershipRepository.save(newMembership)).thenReturn(newMembership);

        TeamMembership result = teamMembershipService.addMember(team, newUser);

        assertThat(result).isEqualTo(newMembership);
    }
}
