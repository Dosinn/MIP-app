package com.projekty.projekty.Team;

import org.springframework.stereotype.Component;

@Component
public class TeamFactory {

    public Team create(int year) {
        return Team.builder()
                .year(year)
                .build();
    }
}
