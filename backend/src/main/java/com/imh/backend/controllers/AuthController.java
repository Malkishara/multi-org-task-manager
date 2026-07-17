package com.imh.backend.controllers;

import com.imh.backend.dtos.AuthRequest;
import com.imh.backend.dtos.AuthResponse;
import com.imh.backend.entities.User;
import com.imh.backend.repositories.UserRepository;
import com.imh.backend.security.JwtService;
import com.imh.backend.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user.
     *
     * Design Pattern:
     * MVC Controller Pattern
     * The controller only handles HTTP requests and delegates business logic to the service layer.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @Valid @RequestBody AuthRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.signup(request));
    }

    /**
     * Authenticate a user.
     *
     * Design Pattern:
     * MVC Controller Pattern
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * TODO
     * Activate user account.
     *
     * Design Pattern:
     * MVC Controller Pattern
     *
     * Responsibility:
     * Receives activation request and delegates
     * business logic to the service layer.
     */
    @GetMapping("/activate")
    public ResponseEntity<AuthResponse> activateAccount(
            @RequestParam Long userId,
            @RequestParam String key) {

        return ResponseEntity.ok(
                authService.activateAccount(userId, key)
        );
    }


    /**
     * TODO
     * Resend activation email.
     *
     * Design Pattern:
     * MVC Controller Pattern
     *
     * Responsibility:
     * Accepts resend request and delegates
     * validation/business logic to service layer.
     */
    @PostMapping("/resend-activation")
    public ResponseEntity<String> resendActivation(
            @RequestParam String email) {

        authService.resendActivationLink(email);

        return ResponseEntity.ok(
                "Activation email sent successfully."
        );
    }
}
