package com.projekty.projekty.util;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendLoginCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your login code");
        message.setText("Your verification code is: " + code + "\n\nThis code will expire in 10 minutes.");
        mailSender.send(message);
    }

    public void sendTeamInviteEmail(String toEmail, String inviteToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("You've been invited to join a project team");
        message.setText("You have been invited to join a team. Open the app and go to your invites, or use this token: "
                + inviteToken);
        mailSender.send(message);
    }
}
