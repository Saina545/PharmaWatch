package com.pharmawatch.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String token, String firstName) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("PharmaWatch - Password Reset Request");
            message.setText(
                "Dear " + firstName + ",\n\n" +
                "You have requested to reset your PharmaWatch account password.\n\n" +
                "Click the link below to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request this reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The PharmaWatch Team"
            );

            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            // Don't throw - we don't want to leak info about whether email exists
        }
    }

    public void sendWelcomeEmail(String toEmail, String firstName, String companyName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to PharmaWatch!");
            message.setText(
                "Dear " + firstName + ",\n\n" +
                "Welcome to PharmaWatch! Your account for " + companyName + " has been created successfully.\n\n" +
                "You can now log in to your dashboard at: " + frontendUrl + "\n\n" +
                "PharmaWatch helps your team stay ahead of drug safety signals by automatically scanning medical literature every night.\n\n" +
                "Best regards,\n" +
                "The PharmaWatch Team"
            );

            mailSender.send(message);
            log.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }
}
