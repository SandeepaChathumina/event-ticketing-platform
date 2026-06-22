package com.ticketing.app.identity.service;

import com.ticketing.app.identity.model.User;
import com.ticketing.app.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            log.info("Attempting to load user by email: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("User not found in database: {}", email);
                        return new UsernameNotFoundException("User not found: " + email);
                    });

            log.info("User found! Mapping authorities for: {}", email);

            // Safeguard: If the user was registered before roles were implemented, getRoles() might be null.
            var authorities = user.getRoles() == null 
                    ? Collections.<SimpleGrantedAuthority>emptyList() 
                    : user.getRoles().stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    authorities
            );
        } catch (Exception e) {
            log.error("CRITICAL ERROR inside CustomUserDetailsService: ", e);
            throw e; // Rethrow so Spring Security/Global Exception Handler can catch it
        }
    }
}