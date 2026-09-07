package com.projekty.projekty.TeamInvite;

import com.projekty.projekty.User.UserResponse;

import java.time.LocalDateTime;

public record TeamInviteResponse(
        Long id,
        Long teamId,
        String inviteToken,
        UserResponse invitedUser,
        UserResponse invitedBy,
        InviteStatus status,
        LocalDateTime createdAt
) {
    public static TeamInviteResponse from(TeamInvite invite) {
        return new TeamInviteResponse(
                invite.getId(),
                invite.getTeam() != null ? invite.getTeam().getId() : null,
                invite.getInviteToken(),
                UserResponse.from(invite.getInvitedUser()),
                UserResponse.from(invite.getInvitedBy()),
                invite.getStatus(),
                invite.getCreatedAt()
        );
    }
}
