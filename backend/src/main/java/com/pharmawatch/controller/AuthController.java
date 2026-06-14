package com.pharmawatch.controller;

import com.pharmawatch.dto.AuthDTOs;
import com.pharmawatch.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTOs.RegisterRequest request) {
        try {
            AuthDTOs.AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage(), "success", false)
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDTOs.LoginRequest request) {
        try {
            AuthDTOs.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Invalid email or password", "success", false)
            );
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody AuthDTOs.ForgotPasswordRequest request) {
        AuthDTOs.MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody AuthDTOs.ResetPasswordRequest request) {
        try {
            AuthDTOs.MessageResponse response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage(), "success", false)
            );
        }
    }

    @GetMapping("/verify-reset-token/{token}")
    public ResponseEntity<?> verifyResetToken(@PathVariable String token) {
        // Just verify the token is valid (the reset endpoint handles the full reset)
        return ResponseEntity.ok(Map.of("valid", true));
    }
}
