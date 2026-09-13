package com.projekty.projekty.TeamInvite;

import com.projekty.projekty.CustomException.*;
import com.projekty.projekty.Team.Team;
import com.projekty.projekty.Team.TeamMembership;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.Team.TeamService;
import com.projekty.projekty.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeamInviteService {

    private final TeamInviteRepository teamInviteRepository;
    private final TeamInviteFactory teamInviteFactory;
    private final TeamMembershipService teamMembershipService;
    private final TeamService teamService;

    public TeamInvite inviteMember(User inviter, User invitedUser) {
        if (inviter.getId().equals(invitedUser.getId())) {
            throw new AccessForbiddenException("You cannot invite yourself");
        }

        if (teamMembershipService.getTeamOfUser(invitedUser).isPresent()) {
            throw new UserAlreadyInTeamException("This user is already part of a team");
        }

        Optional<Team> inviterTeam = teamMembershipService.getTeamOfUser(inviter);

        if (inviterTeam.isPresent()) {
            Team team = inviterTeam.get();
            if (!teamMembershipService.isMember(team, inviter)) {
                throw new AccessForbiddenException("Only current team members can invite others");
            }

            List<TeamMembership> existingMembers = teamMembershipService.getMembers(team);

            if (!existingMembers.isEmpty()) {
                User existingTeacher = existingMembers.get(0).getUser().getTeacher();
                User newUserTeacher = invitedUser.getTeacher();
                boolean sameTeacher = existingTeacher != null && newUserTeacher != null
                        && existingTeacher.getId().equals(newUserTeacher.getId());
                if (!sameTeacher) {
                    throw new TeacherMismatchException("All team members must share the same teacher");
                }
            }

            teamInviteRepository.findByTeamAndInvitedUserAndStatus(team, invitedUser, InviteStatus.PENDING)
                    .ifPresent(existing -> {
                        throw new InviteAlreadyExistsException("This user has already been invited and hasn't responded yet");
                    });
        } else {
            User inviterTeacher = inviter.getTeacher();
            User invitedTeacher = invitedUser.getTeacher();
            boolean sameTeacher = inviterTeacher != null && invitedTeacher != null
                    && inviterTeacher.getId().equals(invitedTeacher.getId());
            if (!sameTeacher) {
                throw new TeacherMismatchException("All team members must share the same teacher");
            }

            teamInviteRepository.findByInvitedByAndInvitedUserAndStatus(inviter, invitedUser, InviteStatus.PENDING)
                    .ifPresent(existing -> {
                        throw new InviteAlreadyExistsException("This user has already been invited and hasn't responded yet");
                    });
        }

        TeamInvite invite = teamInviteFactory.create(inviterTeam.orElse(null), invitedUser, inviter);
        invite = teamInviteRepository.save(invite);

        return invite;
    }

    public TeamInvite getByToken(String token) {
        return teamInviteRepository.findByInviteToken(token)
                .orElseThrow(() -> new TeamInviteNotFoundException("Invite not found with token: " + token));
    }

    public TeamInvite acceptInvite(User currentUser, String token) {
        TeamInvite invite = getInviteAndValidateOwnership(currentUser, token);

        if (teamMembershipService.getTeamOfUser(currentUser).isPresent()) {
            throw new UserAlreadyInTeamException("You are already part of a team");
        }

        User inviter = invite.getInvitedBy();
        Team team = teamMembershipService.getTeamOfUser(inviter).orElse(null);

        if (team == null) {
            team = teamService.createTeam(inviter);
        }

        teamMembershipService.addMember(team, currentUser);

        // Delete the accepted invite record
        teamInviteRepository.delete(invite);

        // currentUser joined a team — clean up ALL their pending invites (incoming + outgoing)
        teamInviteRepository.deleteByInvitedUserAndStatus(currentUser, InviteStatus.PENDING);
        teamInviteRepository.deleteByInvitedByAndStatus(currentUser, InviteStatus.PENDING);

        // Inviter is also now in a team — clean up pending invites sent TO them
        // (inviter can still send new invites, so we only remove incoming)
        teamInviteRepository.deleteByInvitedUserAndStatus(inviter, InviteStatus.PENDING);

        // Return a transient response object (not persisted)
        invite.setTeam(team);
        invite.setStatus(InviteStatus.ACCEPTED);
        return invite;
    }

    public TeamInvite declineInvite(User currentUser, String token) {
        TeamInvite invite = getInviteAndValidateOwnership(currentUser, token);

        // Delete the invite record — it has been acted upon
        teamInviteRepository.delete(invite);

        // Return a transient response object (not persisted)
        invite.setStatus(InviteStatus.DECLINED);
        return invite;
    }

    /** Incoming: invites sent TO the current user that are still pending */
    public List<TeamInvite> getMyPendingInvites(User currentUser) {
        return teamInviteRepository.findByInvitedUserAndStatus(currentUser, InviteStatus.PENDING);
    }

    /** Outgoing: invites sent BY the current user that are still pending */
    public List<TeamInvite> getMySentPendingInvites(User currentUser) {
        return teamInviteRepository.findByInvitedByAndStatus(currentUser, InviteStatus.PENDING);
    }

    private TeamInvite getInviteAndValidateOwnership(User currentUser, String token) {
        TeamInvite invite = getByToken(token);

        if (!invite.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new AccessForbiddenException("This invite does not belong to you");
        }

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new AccessForbiddenException("This invite has already been responded to");
        }

        return invite;
    }
}
