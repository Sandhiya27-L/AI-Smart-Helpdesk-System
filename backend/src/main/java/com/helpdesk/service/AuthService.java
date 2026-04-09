package com.helpdesk.service;

import com.helpdesk.dto.*;
import com.helpdesk.entity.*;
import com.helpdesk.enums.RoleName;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.*;
import com.helpdesk.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final RoleRepository        roleRepository;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider      tokenProvider;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        /*RoleName roleName = RoleName.USER;
        if (req.getRole() != null) {
            try { roleName = RoleName.valueOf(req.getRole().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        */
        // 1. Determine the name logic first
        RoleName targetRoleName = RoleName.USER;
        if (req.getRole() != null) {
            try {
                targetRoleName = RoleName.valueOf(req.getRole().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Fallback to USER or handle error
            }
        }

        // 2. Make a final copy for the lambda to "capture"
        final RoleName finalRoleName = targetRoleName;

        Role role = roleRepository.findByName(finalRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + finalRoleName));
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .department(req.getDepartment())
                .phone(req.getPhone())
                .role(role)
                .isActive(true)
                .build();

        userRepository.save(user);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        return buildResponse(user, tokenProvider.generateToken(auth));
    }

    public AuthResponse login(AuthRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildResponse(user, tokenProvider.generateToken(auth));
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .department(user.getDepartment())
                .build();
    }
}
