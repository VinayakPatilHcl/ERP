package com.hospital.erp.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class AuthDtos {

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password) {}

    public record AuthResponse(
            String token,
            String tokenType,
            long expiresInMinutes,
            String username,
            String fullName,
            Set<String> roles) {}

    public record RegisterRequest(
            @NotBlank @Size(max = 64) String username,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotBlank String fullName,
            String email,
            Set<String> roles) {}

    public record UserSummary(
            Long id,
            String username,
            String fullName,
            String email,
            boolean enabled,
            Set<String> roles) {}
}
