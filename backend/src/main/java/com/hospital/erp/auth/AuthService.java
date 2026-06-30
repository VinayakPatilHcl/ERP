package com.hospital.erp.auth;

import com.hospital.erp.common.exception.BadRequestException;
import com.hospital.erp.security.JwtService;
import com.hospital.erp.user.Role;
import com.hospital.erp.user.User;
import com.hospital.erp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.jwt.expiration-minutes}")
    private long expirationMinutes;

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        UserDetails principal = (UserDetails) auth.getPrincipal();
        String token = jwtService.generateToken(principal);
        User user = userRepository.findByUsername(principal.getUsername()).orElseThrow();
        return new AuthDtos.AuthResponse(
                token,
                "Bearer",
                expirationMinutes,
                user.getUsername(),
                user.getFullName(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
    }

    @Transactional
    public AuthDtos.UserSummary register(AuthDtos.RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new BadRequestException("Username already taken");
        }
        Set<Role> roles = (req.roles() == null || req.roles().isEmpty())
                ? Set.of(Role.RECEPTIONIST)
                : req.roles().stream().map(Role::valueOf).collect(Collectors.toSet());

        User u = User.builder()
                .username(req.username())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .email(req.email())
                .enabled(true)
                .roles(roles)
                .build();
        u = userRepository.save(u);
        return toSummary(u);
    }

    public List<AuthDtos.UserSummary> listUsers() {
        return userRepository.findAll().stream().map(this::toSummary).toList();
    }

    @Transactional
    public AuthDtos.UserSummary setEnabled(Long id, boolean enabled) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found"));
        u.setEnabled(enabled);
        return toSummary(userRepository.save(u));
    }

    @Transactional
    public AuthDtos.UserSummary resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }
        User u = userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found"));
        u.setPassword(passwordEncoder.encode(newPassword));
        return toSummary(userRepository.save(u));
    }

    private AuthDtos.UserSummary toSummary(User u) {
        return new AuthDtos.UserSummary(u.getId(), u.getUsername(), u.getFullName(), u.getEmail(),
                u.isEnabled(), u.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
    }
}
