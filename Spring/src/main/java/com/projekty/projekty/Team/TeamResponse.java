package com.projekty.projekty.Team;

import com.projekty.projekty.User.UserResponse;

import java.util.List;

public record TeamResponse(
        Long id,
        List<UserResponse> members,
        int year
) {
    public static TeamResponse from(Team team, List<TeamMembership> memberships) {
        return new TeamResponse(
                team.getId(),
                memberships.stream().map(m -> UserResponse.from(m.getUser())).toList(),
                team.getYear()
        );
    }

    public static TeamResponse fromUsers(Team team, List<com.projekty.projekty.User.User> users) {
        return new TeamResponse(
                team.getId(),
                users.stream().map(UserResponse::from).toList(),
                team.getYear()
        );
    }
}
