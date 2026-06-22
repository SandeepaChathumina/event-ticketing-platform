package com.ticketing.app.identity.controller;

import com.ticketing.app.identity.dto.LoginRequest;
import com.ticketing.app.identity.dto.RegisterRequest;
import com.ticketing.app.identity.dto.AuthResponse;
import com.ticketing.app.identity.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            authService.registerUser(request.getEmail(), request.getPassword());
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: Email might already exist.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            AuthResponse response = authService.loginUser(request.getEmail(), request.getPassword());
            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed: ", e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/make-admin/{email}")
    public ResponseEntity<String> makeAdmin(@PathVariable String email) {
        try {
            authService.makeUserAdmin(email);
            return ResponseEntity.ok("User promoted to admin");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to promote user: " + e.getMessage());
        }
    }
}