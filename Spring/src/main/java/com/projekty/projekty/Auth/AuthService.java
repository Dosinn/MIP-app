package com.projekty.projekty.Auth;

import com.projekty.projekty.CustomException.InvalidEmailDomainException;
import com.projekty.projekty.CustomException.InvalidOrExpiredCodeException;
import com.projekty.projekty.Team.TeamMembershipService;
import com.projekty.projekty.User.User;
import com.projekty.projekty.User.UserFactory;
import com.projekty.projekty.User.UserRepository;
import com.projekty.projekty.User.UserResponse;
import com.projekty.projekty.util.JwtService;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserFactory userFactory;
    private final TeamMembershipService teamMembershipService;
    private final JwtService jwtService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.google.allowed-domains:@stuba.sk,gmail.com}")
    private String allowedDomains;

    @Transactional
    public LoginResponse googleLogin(String token) {
        try {
            String email = null;
            String fullName = null;

            // 1. If JWT format (3 parts separated by dots), verify as Google ID Token
            if (token != null && token.split("\\.").length == 3) {
                try {
                    GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                            GoogleNetHttpTransport.newTrustedTransport(),
                            GsonFactory.getDefaultInstance())
                            .setAudience(Collections.singletonList(googleClientId))
                            .build();

                    GoogleIdToken idToken = verifier.verify(token);
                    if (idToken != null) {
                        GoogleIdToken.Payload payload = idToken.getPayload();
                        email = payload.getEmail();
                        fullName = (String) payload.get("name");
                        if (fullName == null || fullName.isBlank()) {
                            String givenName = (String) payload.get("given_name");
                            String familyName = (String) payload.get("family_name");
                            fullName = ((givenName != null ? givenName : "") + " " + (familyName != null ? familyName : "")).trim();
                        }
                    }
                } catch (Exception ignored) {
                    // Fall back to Google userinfo endpoint below
                }
            }

            // 2. If not ID token or verification didn't resolve email, verify via Google Userinfo endpoint using access token
            if (email == null || email.isBlank()) {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                        .header("Authorization", "Bearer " + token)
                        .GET()
                        .build();
                HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    JsonObject node = JsonParser.parseString(response.body()).getAsJsonObject();
                    if (node.has("email") && !node.get("email").isJsonNull()) {
                        email = node.get("email").getAsString();
                    }
                    if (node.has("name") && !node.get("name").isJsonNull()) {
                        fullName = node.get("name").getAsString();
                    }
                }
            }

            if (email == null || email.isBlank()) {
                throw new InvalidOrExpiredCodeException("Invalid or expired Google token");
            }

            boolean isDomainAllowed = false;
            String lowerEmail = email.toLowerCase().trim();
            for (String domain : allowedDomains.split(",")) {
                String d = domain.trim().toLowerCase();
                if (d.startsWith("@") && lowerEmail.endsWith(d)) {
                    isDomainAllowed = true;
                    break;
                } else if (!d.startsWith("@") && (lowerEmail.endsWith("@" + d) || lowerEmail.endsWith("." + d))) {
                    isDomainAllowed = true;
                    break;
                }
            }

            if (!isDomainAllowed) {
                throw new InvalidEmailDomainException("Email domain not allowed. Allowed: " + allowedDomains);
            }

            final String finalName = fullName != null ? fullName : "";

            User user = userRepository.findByEmail(lowerEmail)
                    .orElseGet(() -> {
                        User created = userRepository.save(userFactory.createFromGoogle(lowerEmail, finalName));
                        teamMembershipService.ensureMembership(created);
                        return created;
                    });

            if ((user.getName() == null || user.getName().isBlank()) && !finalName.isBlank()) {
                user.setName(finalName);
                userRepository.save(user);
            }

            String jwt = jwtService.generateToken(user.getEmail());
            return new LoginResponse(jwt, UserResponse.from(user));
        } catch (InvalidEmailDomainException | InvalidOrExpiredCodeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage(), e);
        }
    }
}
