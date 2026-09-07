package com.projekty.projekty.Team;

import com.projekty.projekty.User.User;
import org.springframework.stereotype.Component;

@Component
public class TeamMembershipFactory {

    public TeamMembership create(Team team, User user) {
        return TeamMembership.builder()
                .team(team)
                .user(user)
                .build();
    }
}
