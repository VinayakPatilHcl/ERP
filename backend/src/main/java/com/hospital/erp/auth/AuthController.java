package com.hospital.erp.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public AuthDtos.UserSummary register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        return authService.register(req);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuthDtos.UserSummary> listUsers() {
        return authService.listUsers();
    }

    @PatchMapping("/users/{id}/enabled")
    @PreAuthorize("hasRole('ADMIN')")
    public AuthDtos.UserSummary setEnabled(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return authService.setEnabled(id, Boolean.TRUE.equals(body.get("enabled")));
    }

    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public AuthDtos.UserSummary resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return authService.resetPassword(id, body.get("password"));
    }
}
