// src/main/java/com/ticketing/app/identity/service/AuthService.java
package com.ticketing.app.identity.service;

import com.ticketing.app.identity.dto.AuthResponse;
import com.ticketing.app.identity.model.User;
import com.ticketing.app.identity.repository.UserRepository;
import com.ticketing.app.identity.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public void registerUser(String email, String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of("ROLE_USER"));
        userRepository.save(user);
    }

    public AuthResponse loginUser(String email, String password) {
        // This validates the password against the hashed database password
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        
        User user = userRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(user);
        
        return new AuthResponse(token);
    }
}