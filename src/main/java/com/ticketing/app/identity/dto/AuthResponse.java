// src/main/java/com/ticketing/app/identity/dto/AuthResponse.java
package com.ticketing.app.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Set;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private Set<String> roles;
}