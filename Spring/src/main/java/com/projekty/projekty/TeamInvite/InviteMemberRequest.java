package com.projekty.projekty.TeamInvite;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InviteMemberRequest(
        @NotBlank @Email String invitedEmail
) {}
