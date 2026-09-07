package com.projekty.projekty.Team;

import com.projekty.projekty.CustomException.AccessForbiddenException;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserResponse;
import com.projekty.projekty.User.UserRole;
import com.projekty.projekty.User.UserService;
import com.projekty.projekty.util.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final TeamMembershipService teamMembershipService;
    private final UserService userService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam() {
        User currentUser = currentUserProvider.getCurrentUser();
        Team team = teamService.createTeam(currentUser);
        List<TeamMembership> members = teamMembershipService.getMembers(team);
        return ResponseEntity.ok(TeamResponse.from(team, members));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable Long id) {
        Team team = teamService.getTeamById(id);
        List<TeamMembership> members = teamMembershipService.getMembers(team);
        return ResponseEntity.ok(TeamResponse.from(team, members));
    }

    @GetMapping("/me")
    public ResponseEntity<TeamResponse> getMyTeam() {
        User currentUser = currentUserProvider.getCurrentUser();
        return teamService.getMyTeam(currentUser)
                .map(team -> {
                    List<TeamMembership> members = teamMembershipService.getMembers(team);
                    return ResponseEntity.ok(TeamResponse.from(team, members));
                })
                .orElseGet(() -> ResponseEntity.ok(
                        new TeamResponse(null, List.of(UserResponse.from(currentUser)), java.time.Year.now().getValue())
                ));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeMemberFromTeam(@PathVariable Long teamId, @PathVariable Long userId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Team team = teamService.getTeamById(teamId);
        User userToRemove = userService.getUserById(userId);

        if (currentUser.getUserRole() != UserRole.ADMIN) {
            if (currentUser.getUserRole() == UserRole.TEACHER || currentUser.isTeacher()) {
                if (userToRemove.getTeacher() == null || !userToRemove.getTeacher().getId().equals(currentUser.getId())) {
                    throw new AccessForbiddenException("You can only manage members of your own students");
                }
            } else {
                throw new AccessForbiddenException("Only teachers and admins can remove members from teams");
            }
        }

        teamMembershipService.removeMember(team, userToRemove);
        return ResponseEntity.ok().build();
    }
}

