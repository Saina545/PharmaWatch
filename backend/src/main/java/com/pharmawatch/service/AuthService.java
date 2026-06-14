package com.pharmawatch.service;

import com.pharmawatch.dto.AuthDTOs;
import com.pharmawatch.entity.Company;
import com.pharmawatch.entity.User;
import com.pharmawatch.repository.CompanyRepository;
import com.pharmawatch.repository.UserRepository;
import com.pharmawatch.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${app.password-reset-token-expiry}")
    private long passwordResetTokenExpiry;

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Find or create company
        Company company = companyRepository.findByName(request.getCompanyName())
                .orElseGet(() -> {
                    Company newCompany = Company.builder()
                            .name(request.getCompanyName())
                            .domain(request.getCompanyDomain())
                            .subscriptionPlan(Company.SubscriptionPlan.TRIAL)
                            .active(true)
                            .build();
                    return companyRepository.save(newCompany);
                });

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .jobTitle(request.getJobTitle())
                .company(company)
                .role(User.Role.ADMIN) // First user is admin
                .active(true)
                .emailVerified(true) // Skip email verification for now
                .build();

        userRepository.save(user);

        // Send welcome email asynchronously
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), company.getName());

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDTOs.MessageResponse forgotPassword(AuthDTOs.ForgotPasswordRequest request) {
        // Always return success to prevent email enumeration
        String successMessage = "If an account exists with this email, you will receive a password reset link shortly.";

        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(
                    LocalDateTime.now().plusSeconds(passwordResetTokenExpiry / 1000)
            );
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), token, user.getFirstName());
        });

        return new AuthDTOs.MessageResponse(successMessage, true);
    }

    @Transactional
    public AuthDTOs.MessageResponse resetPassword(AuthDTOs.ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return new AuthDTOs.MessageResponse("Password reset successfully. You can now log in.", true);
    }

    private AuthDTOs.AuthResponse generateAuthResponse(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("companyId", user.getCompany().getId());

        String accessToken = jwtUtil.generateToken(extraClaims, user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        AuthDTOs.AuthResponse.UserInfo userInfo = new AuthDTOs.AuthResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setFirstName(user.getFirstName());
        userInfo.setLastName(user.getLastName());
        userInfo.setEmail(user.getEmail());
        userInfo.setJobTitle(user.getJobTitle());
        userInfo.setRole(user.getRole().name());

        AuthDTOs.AuthResponse.CompanyInfo companyInfo = new AuthDTOs.AuthResponse.CompanyInfo();
        companyInfo.setId(user.getCompany().getId());
        companyInfo.setName(user.getCompany().getName());
        companyInfo.setDomain(user.getCompany().getDomain());
        companyInfo.setSubscriptionPlan(user.getCompany().getSubscriptionPlan().name());
        userInfo.setCompany(companyInfo);

        AuthDTOs.AuthResponse response = new AuthDTOs.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUser(userInfo);

        return response;
    }
}
