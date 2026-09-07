package com.projekty.projekty.Team;

import com.projekty.projekty.CustomException.TeacherMismatchException;
import com.projekty.projekty.CustomException.TeamFullException;
import com.projekty.projekty.CustomException.UserAlreadyInTeamException;
import com.projekty.projekty.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeamMembershipService {

    private final TeamMembershipRepository teamMembershipRepository;
    private final TeamMembershipFactory teamMembershipFactory;

    public TeamMembership ensureMembership(User user) {
        return teamMembershipRepository.findByUser(user)
                .orElseGet(() -> teamMembershipRepository.save(TeamMembership.builder()
                        .user(user)
                        .team(null)
                        .build()));
    }

    public Optional<TeamMembership> getMembership(User user) {
        return teamMembershipRepository.findByUser(user);
    }

    public TeamMembership assignTeam(User user, Team team) {
        TeamMembership membership = teamMembershipRepository.findByUser(user)
                .orElseGet(() -> teamMembershipRepository.save(teamMembershipFactory.create(team, user)));

        if (membership.getTeam() != null && !membership.getTeam().getId().equals(team.getId())) {
            throw new UserAlreadyInTeamException("User is already part of a team");
        }

        membership.setTeam(team);
        return teamMembershipRepository.save(membership);
    }

    public TeamMembership addMember(Team team, User user) {
        TeamMembership existingMembership = teamMembershipRepository.findByUser(user).orElse(null);

        if (existingMembership != null && existingMembership.getTeam() != null) {
            throw new UserAlreadyInTeamException("User is already part of a team");
        }

        List<TeamMembership> existingMembers = teamMembershipRepository.findByTeam(team);

        if (!existingMembers.isEmpty()) {
            User existingTeacher = existingMembers.get(0).getUser().getTeacher();
            User newUserTeacher = user.getTeacher();

            boolean sameTeacher = existingTeacher != null && newUserTeacher != null
                    && existingTeacher.getId().equals(newUserTeacher.getId());

            if (!sameTeacher) {
                throw new TeacherMismatchException("All team members must share the same teacher");
            }
        }

        if (existingMembership == null) {
            TeamMembership membership = teamMembershipFactory.create(team, user);
            return teamMembershipRepository.save(membership);
        }

        existingMembership.setTeam(team);
        return teamMembershipRepository.save(existingMembership);
    }

    public List<TeamMembership> getMembers(Team team) {
        return teamMembershipRepository.findByTeam(team);
    }

    public boolean isMember(Team team, User user) {
        return teamMembershipRepository.findByTeam(team).stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()));
    }

    public Optional<Team> getTeamOfUser(User user) {
        return teamMembershipRepository.findByUser(user)
                .map(TeamMembership::getTeam)
                .filter(team -> team != null);
    }

    public void removeMember(Team team, User user) {
        Optional<TeamMembership> membershipOpt = teamMembershipRepository.findByUser(user);
        if (membershipOpt.isPresent()) {
            TeamMembership membership = membershipOpt.get();
            if (membership.getTeam() != null && membership.getTeam().getId().equals(team.getId())) {
                membership.setTeam(null);
                teamMembershipRepository.save(membership);
            }
        }
    }

    public void unassignAllMembers(Team team) {
        List<TeamMembership> members = teamMembershipRepository.findByTeam(team);
        for (TeamMembership tm : members) {
            tm.setTeam(null);
            teamMembershipRepository.save(tm);
        }
    }
}
