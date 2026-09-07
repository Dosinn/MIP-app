package com.projekty.projekty.Auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/request-code")
    public ResponseEntity<Void> requestCode(@Valid @RequestBody RequestCodeRequest request) {
        authService.requestCode(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<LoginResponse> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        return ResponseEntity.ok(authService.verifyCode(request.email(), request.code()));
    }
}
