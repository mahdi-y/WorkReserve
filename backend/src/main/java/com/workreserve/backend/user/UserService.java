package com.workreserve.backend.user;

import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.config.JwtService;
import com.workreserve.backend.user.DTO.AuthResponse;
import com.workreserve.backend.user.DTO.AuthResponseToken;
import com.workreserve.backend.user.DTO.LoginRequest;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.UpdateProfileRequest;
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
import com.workreserve.backend.exception.TokenExpiredException;
import com.workreserve.backend.exception.TwoFactorRequiredException;
import com.workreserve.backend.exception.UserException;

import org.springframework.security.core.context.SecurityContextHolder;
import com.workreserve.backend.user.DTO.ChangePasswordRequest;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import com.workreserve.backend.auth.TwoFactorService;
import com.workreserve.backend.auth.DTO.TwoFactorLoginRequest;


@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    

    private MailService emailService;

    private ActivityService activityService;

    private TwoFactorService twoFactorService;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        @Lazy AuthenticationManager authenticationManager,
        MailService emailService,
        ActivityService activityService, 
        TwoFactorService twoFactorService 
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.activityService = activityService;  
        this.twoFactorService = twoFactorService; 
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Cacheable("users")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "users", key = "#id")
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserResponse(user);
    }

    @Cacheable(value = "current-user", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UserException("User not authenticated");
        }
        
        String email = authentication.getName();
        if (email == null || email.equals("anonymousUser")) {
            throw new UserException("User not authenticated");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found with email: " + email));
        
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
        
        activityService.logActivity(
            savedUser.getId(),
            "New user registered: " + savedUser.getEmail(),
            "USER",
            savedUser.getId(),
            savedUser.getFullName()
        );
        
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);
        
        String token = jwtService.generateToken(savedUser.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponseToken loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserException("Invalid credentials"));

        if (user.isLocked()) {
            throw new UserException("Account is locked. Please check your email to unlock.");
        }

        if (user.isBanned()) {
            throw new UserException("Your account has been banned! Please contact support.");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            handleFailedLogin(user);
            throw new UserException("Invalid credentials");
        }

        if (user.getTwoFactorEnabled()) {
            throw new TwoFactorRequiredException("Two-factor authentication required");
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

        return new AuthResponseToken(accessToken, refreshToken, toUserResponse(user));
    }

    public AuthResponseToken loginUserWith2FA(TwoFactorLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserException("Invalid credentials"));

        if (user.isLocked()) {
            throw new UserException("Account is locked. Please check your email to unlock.");
        }

        if (user.isBanned()) {
            throw new UserException("Your account has been banned! Please contact support.");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            handleFailedLogin(user);
            throw new UserException("Invalid credentials");
        }

        boolean isValidCode = false;
        String twoFactorCode = request.getTwoFactorCode();
        
        if (twoFactorCode.length() == 6 && twoFactorCode.matches("\\d+")) {
            isValidCode = twoFactorService.verifyCode(user.getTwoFactorSecret(), twoFactorCode);
        }
        
        if (!isValidCode && twoFactorCode.length() == 8) {
            isValidCode = twoFactorService.useBackupCode(user, twoFactorCode);
        }
        
        if (!isValidCode) {
            throw new UserException("Invalid 2FA code or backup code");
        }

        user.setFailedLoginAttempts(0);
        user.setAccountLockedAt(null);
        userRepository.save(user);

        if (!user.isEmailVerified()) {
            throw new UserException("Email not verified. Please check your inbox.");
        }

        String accessToken = jwtService.generateToken(user.getEmail());
        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        return new AuthResponseToken(accessToken, refreshToken, toUserResponse(user));
    }

    public boolean requiresTwoFactor(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null && user.getTwoFactorEnabled();
    }

    private void handleFailedLogin(User user) {
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
        if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
            user.setLocked(true);
            user.setAccountLockedAt(LocalDateTime.now());
            String unlockToken = UUID.randomUUID().toString();
            user.setUnlockToken(unlockToken);
            user.setUnlockTokenCreatedAt(LocalDateTime.now());
            userRepository.save(user);
            emailService.sendAccountUnlockEmail(user.getEmail(), user.getFullName(), unlockToken);
            throw new UserException("Account locked due to too many failed login attempts. Check your email to unlock.");
        }
        userRepository.save(user);
    }

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
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

        activityService.logActivity(
            user.getId(),
            "Updated profile information",
            "USER",
            user.getId(),
            user.getFullName()
        );

        return toUserResponse(updatedUser);
    }

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userRepository.delete(user);
    }

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
    public UserResponse updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        
        return toUserResponse(updatedUser);
    }

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setEnabled(!user.isEnabled());
        User updatedUser = userRepository.save(user);
        
        return toUserResponse(updatedUser);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new UserException("Invalid verification token."));

        if (user.getVerificationTokenCreatedAt() == null ||
            user.getVerificationTokenCreatedAt().plusHours(24).isBefore(LocalDateTime.now())) {
            throw new UserException("Verification token has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenCreatedAt(null);
        userRepository.save(user);

        activityService.logActivity(
            user.getId(),
            "Verified email address",
            "USER",
            user.getId(),
            user.getFullName()
        );

        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
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
        response.setBanned(user.isBanned());
        response.setEmailVerified(user.isEmailVerified());
        response.setTwoFactorEnabled(user.getTwoFactorEnabled() != null ? user.getTwoFactorEnabled() : false);
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
    
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), newToken);
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

        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);

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

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
    public UserResponse setUserBanned(Long id, boolean banned) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(banned);
        User updatedUser = userRepository.save(user);
        return toUserResponse(updatedUser);
    }

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
    public UserResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new UserException("Email already in use by another account");
            }
            
            user.setEmail(request.getEmail());
            user.setEmailVerified(false); 
            
            String verificationToken = UUID.randomUUID().toString();
            user.setVerificationToken(verificationToken);
            user.setVerificationTokenCreatedAt(LocalDateTime.now());
            
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);
        }

        User updatedUser = userRepository.save(user);

        activityService.logActivity(
            user.getId(),
            "Updated profile information",
            "USER",
            user.getId(),
            user.getFullName()
        );

        return toUserResponse(updatedUser);
    }
    
}
