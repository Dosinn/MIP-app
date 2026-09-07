package com.projekty.projekty.Team;

import com.projekty.projekty.User.UserResponse;

public record TeamMemberResponse(
        Long membershipId,
        UserResponse user
) {
    public static TeamMemberResponse from(TeamMembership membership) {
        return new TeamMemberResponse(
                membership.getId(),
                UserResponse.from(membership.getUser())
        );
    }
}
