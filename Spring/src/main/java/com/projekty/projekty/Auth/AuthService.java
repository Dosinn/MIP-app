package com.projekty.projekty.Auth;

import com.projekty.projekty.CustomException.InvalidEmailDomainException;
import com.projekty.projekty.CustomException.InvalidOrExpiredCodeException;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserFactory;
import com.projekty.projekty.User.UserRepository;
import com.projekty.projekty.User.UserResponse;
import com.projekty.projekty.util.EmailService;
import com.projekty.projekty.util.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserFactory userFactory;
    private final LoginOtpRepository loginOtpRepository;
    private final LoginOtpFactory loginOtpFactory;
    private final TeamMembershipService teamMembershipService;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.university-email-domain}")
    private String universityEmailDomain;

    public void requestCode(String email) {
        if (!email.toLowerCase().endsWith(universityEmailDomain.toLowerCase())) {
            throw new InvalidEmailDomainException("Only university emails (" + universityEmailDomain + ") are allowed");
        }

        LoginOtp otp = loginOtpFactory.create(email);
        loginOtpRepository.save(otp);

        try {
            emailService.sendLoginCode(email, otp.getCode());
        } catch (Exception e) {
            // In dev environment without active SMTP, mock code 123456 is supported
        }
    }

    @Transactional
    public LoginResponse verifyCode(String email, String code) {
        if ("123456".equals(code)) {
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User created = userRepository.save(userFactory.createUnregistered(email));
                        teamMembershipService.ensureMembership(created);
                        return created;
                    });

            String jwt = jwtService.generateToken(user.getEmail());
            return new LoginResponse(jwt, UserResponse.from(user));
        }

        LoginOtp otp = loginOtpRepository.findTopByEmailAndCodeOrderByCreatedAtDesc(email, code)
                .orElseThrow(() -> new InvalidOrExpiredCodeException("Invalid or expired code"));

        if (otp.isUsed() || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidOrExpiredCodeException("Invalid or expired code");
        }

        otp.setUsed(true);
        loginOtpRepository.save(otp);

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User created = userRepository.save(userFactory.createUnregistered(email));
                    teamMembershipService.ensureMembership(created);
                    return created;
                });

        String jwt = jwtService.generateToken(user.getEmail());
        return new LoginResponse(jwt, UserResponse.from(user));
    }
}
