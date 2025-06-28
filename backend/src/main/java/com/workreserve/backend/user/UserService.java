package com.workreserve.backend.user;

import com.workreserve.backend.config.JwtService;
import com.workreserve.backend.user.DTO.AuthResponse;
import com.workreserve.backend.user.DTO.AuthResponseToken;
import com.workreserve.backend.user.DTO.LoginRequest;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import com.workreserve.backend.config.MailService;
import com.workreserve.backend.user.exception.UserException;
import com.workreserve.backend.user.exception.TokenExpiredException;
import org.springframework.security.core.context.SecurityContextHolder;
import com.workreserve.backend.user.DTO.ChangePasswordRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    private MailService emailService;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        @Lazy AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserResponse(user);
    }

    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(Role.USER);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(false);
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenCreatedAt(java.time.LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        sendVerificationEmail(savedUser.getEmail(), verificationToken);
        
        String token = jwtService.generateToken(savedUser.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponseToken loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserException("Invalid credentials"));

        if (user.isLocked()) {
            throw new UserException("Account is locked. Please check your email to unlock.");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLocked(true);
                user.setAccountLockedAt(LocalDateTime.now());
                String unlockToken = UUID.randomUUID().toString();
                user.setUnlockToken(unlockToken);
                user.setUnlockTokenCreatedAt(LocalDateTime.now());
                userRepository.save(user);
                sendUnlockEmail(user.getEmail(), unlockToken);
                throw new UserException("Account locked due to too many failed login attempts. Check your email to unlock.");
            }
            userRepository.save(user);
            throw new UserException("Invalid credentials");
        }

        user.setFailedLoginAttempts(0);

        if (!user.isEmailVerified()) {
            throw new UserException("Email not verified. Please check your inbox.");
        }
        String accessToken = jwtService.generateToken(user.getEmail());
        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        return new AuthResponseToken(accessToken, refreshToken);
    }

    public UserResponse updateUser(Long id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return toUserResponse(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userRepository.delete(user);
    }

    public UserResponse updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        
        return toUserResponse(updatedUser);
    }

    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setEnabled(!user.isEnabled());
        User updatedUser = userRepository.save(user);
        
        return toUserResponse(updatedUser);
    }

    private void sendVerificationEmail(String to, String token) {
    String link = "http://localhost:8081/api/auth/verify?token=" + token;
    String subject = "Verify your email";
    String text = "Welcome! Please verify your email by clicking the link: " + link;

    System.out.println("EMAIL VERIFICATION LINK: " + link);

    emailService.sendEmail(to, subject, text);

    }

    public void verifyEmail(String token) {
        User user = userRepository.findAll().stream()
            .filter(u -> token.equals(u.getVerificationToken()))
            .findFirst()
            .orElseThrow(() -> new UserException("Invalid or expired verification token"));

        if (user.getVerificationTokenCreatedAt() == null ||
            user.getVerificationTokenCreatedAt().plusHours(24).isBefore(java.time.LocalDateTime.now())) {
            throw new TokenExpiredException("Verification token has expired. Please request a new verification email.");
        }
        if (user.isEmailVerified()) {
            throw new UserException("Email already verified");
        }
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        response.setEnabled(user.isEnabled());
        response.setLocked(user.isLocked());
        return response;
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found with this email."));
    
        if (user.isEmailVerified()) {
            throw new UserException("Email is already verified.");
        }
    
        String newToken = UUID.randomUUID().toString();
        user.setVerificationToken(newToken);
        user.setVerificationTokenCreatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    
        sendVerificationEmail(user.getEmail(), newToken);
    }

    public void changePassword(ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UserException("Old password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new UserException("New password must be different from the old password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UserException("No user found with this email."));
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        String link = "http://localhost:8081/api/auth/reset-password?token=" + token;
        String subject = "Password Reset Request";
        String text = "To reset your password, click the link: " + link;
        emailService.sendEmail(user.getEmail(), subject, text);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findAll().stream()
            .filter(u -> token.equals(u.getResetPasswordToken()))
            .findFirst()
            .orElseThrow(() -> new UserException("Invalid or expired password reset token."));

        if (user.getResetPasswordTokenCreatedAt() == null ||
            user.getResetPasswordTokenCreatedAt().plusHours(1).isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Password reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenCreatedAt(null);
        userRepository.save(user);
    }

    private void sendUnlockEmail(String to, String unlockToken) {
        String link = "http://localhost:8081/api/auth/unlock?email=" + to + "&token=" + unlockToken;
        String subject = "Unlock your account";
        String text = "Your account has been locked due to too many failed login attempts. Click here to unlock: " + link;
        emailService.sendEmail(to, subject, text);
    }

    public void unlockAccount(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found"));
        if (!user.isLocked()) {
            throw new UserException("Account is not locked.");
        }
        if (user.getUnlockToken() == null || !user.getUnlockToken().equals(token)) {
            throw new UserException("Invalid unlock token.");
        }
        if (user.getUnlockTokenCreatedAt() == null ||
            user.getUnlockTokenCreatedAt().plusHours(1).isBefore(LocalDateTime.now())) {
            throw new UserException("Unlock token has expired. Please try to login again to receive a new unlock email.");
        }
        user.setLocked(false);
        user.setFailedLoginAttempts(0);
        user.setAccountLockedAt(null);
        user.setUnlockToken(null);
        user.setUnlockTokenCreatedAt(null);
        userRepository.save(user);
    }

    public AuthResponseToken refreshToken(String refreshToken) {
        User user = userRepository.findAll().stream()
            .filter(u -> refreshToken.equals(u.getRefreshToken()))
            .findFirst()
            .orElseThrow(() -> new UserException("Invalid refresh token."));

        if (user.getRefreshTokenExpiry() == null || user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Refresh token has expired. Please log in again.");
        }

        String newAccessToken = jwtService.generateToken(user.getEmail());
        String newRefreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        return new AuthResponseToken(newAccessToken, newRefreshToken);
    }
}
