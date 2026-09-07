package com.projekty.projekty.TeamInvite;

import com.projekty.projekty.Team.Team;
import com.projekty.projekty.User.User;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TeamInviteFactory {

    public TeamInvite create(Team team, User invitedUser, User invitedBy) {
        return TeamInvite.builder()
                .team(team)
                .invitedUser(invitedUser)
                .invitedBy(invitedBy)
                .status(InviteStatus.PENDING)
                .inviteToken(UUID.randomUUID().toString())
                .build();
    }
}
