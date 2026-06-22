// src/main/java/com/ticketing/app/identity/dto/LoginRequest.java
package com.ticketing.app.identity.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}