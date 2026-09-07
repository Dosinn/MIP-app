package com.projekty.projekty.TeamInvite;

import com.projekty.projekty.Team.Team;
import com.projekty.projekty.Team.TeamService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserService;
import com.projekty.projekty.util.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invites")
@RequiredArgsConstructor
public class TeamInviteController {

    private final TeamInviteService teamInviteService;
    private final TeamService teamService;
    private final UserService userService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<TeamInviteResponse> inviteMember(@Valid @RequestBody InviteMemberRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        User invitedUser = userService.getUserByEmail(request.invitedEmail());

        TeamInvite invite = teamInviteService.inviteMember(currentUser, invitedUser);
        return ResponseEntity.ok(TeamInviteResponse.from(invite));
    }

    @GetMapping("/{token}")
    public ResponseEntity<TeamInviteResponse> getInviteByToken(@PathVariable String token) {
        return ResponseEntity.ok(TeamInviteResponse.from(teamInviteService.getByToken(token)));
    }

    @PostMapping("/{token}/accept")
    public ResponseEntity<TeamInviteResponse> acceptInvite(@PathVariable String token) {
        User currentUser = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(TeamInviteResponse.from(teamInviteService.acceptInvite(currentUser, token)));
    }

    @PostMapping("/{token}/decline")
    public ResponseEntity<TeamInviteResponse> declineInvite(@PathVariable String token) {
        User currentUser = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(TeamInviteResponse.from(teamInviteService.declineInvite(currentUser, token)));
    }

    @GetMapping("/me/pending")
    public ResponseEntity<List<TeamInviteResponse>> getMyPendingInvites() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<TeamInviteResponse> response = teamInviteService.getMyPendingInvites(currentUser).stream()
                .map(TeamInviteResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/sent")
    public ResponseEntity<List<TeamInviteResponse>> getMySentPendingInvites() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<TeamInviteResponse> response = teamInviteService.getMySentPendingInvites(currentUser).stream()
                .map(TeamInviteResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }
}
