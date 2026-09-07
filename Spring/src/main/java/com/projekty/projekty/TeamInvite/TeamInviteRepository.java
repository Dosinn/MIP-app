package com.projekty.projekty.TeamInvite;

import com.projekty.projekty.Team.Team;
import com.projekty.projekty.User.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamInviteRepository extends JpaRepository<TeamInvite, Long> {
    Optional<TeamInvite> findByInviteToken(String inviteToken);
    List<TeamInvite> findByInvitedUserAndStatus(User invitedUser, InviteStatus status);
    List<TeamInvite> findByInvitedByAndStatus(User invitedBy, InviteStatus status);
    Optional<TeamInvite> findByTeamAndInvitedUserAndStatus(Team team, User invitedUser, InviteStatus status);
    Optional<TeamInvite> findByInvitedByAndInvitedUserAndStatus(User invitedBy, User invitedUser, InviteStatus status);
    @Transactional
    void deleteByInvitedUserAndStatus(User invitedUser, InviteStatus status);

    @Transactional
    void deleteByInvitedByAndStatus(User invitedBy, InviteStatus status);
}
