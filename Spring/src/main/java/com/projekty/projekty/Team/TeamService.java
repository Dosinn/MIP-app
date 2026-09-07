package com.projekty.projekty.Team;

import com.projekty.projekty.CustomException.TeamNotFoundException;
import com.projekty.projekty.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamFactory teamFactory;
    private final TeamMembershipService teamMembershipService;

    public Team createTeam(User creator) {
        Team team = teamFactory.create(Year.now().getValue());
        team = teamRepository.save(team);

        teamMembershipService.assignTeam(creator, team);

        return team;
    }

    public Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new TeamNotFoundException("Team not found with id: " + id));
    }

    public Optional<Team> getMyTeam(User user) {
        return teamMembershipService.getTeamOfUser(user);
    }

    public Team getOrCreateMyTeam(User user) {
        return getMyTeam(user).orElseGet(() -> {
            TeamMembership membership = teamMembershipService.ensureMembership(user);
            if (membership.getTeam() != null) {
                return membership.getTeam();
            }
            return createTeam(user);
        });
    }
}
