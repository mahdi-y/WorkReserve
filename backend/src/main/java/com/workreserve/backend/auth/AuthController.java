package com.workreserve.backend.auth;

import com.workreserve.backend.user.UserService;
import com.workreserve.backend.user.DTO.AuthResponse;
import com.workreserve.backend.user.DTO.AuthResponseToken;
import com.workreserve.backend.user.DTO.ForgotPasswordRequest;
import com.workreserve.backend.user.DTO.LoginRequest;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.ResetPasswordRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseToken> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.loginUser(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully.");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam String email) {
        userService.resendVerificationEmail(email);
        return ResponseEntity.ok("Verification email resent if the account exists.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("If an account with that email exists, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password has been reset successfully.");
    }

    @PostMapping("/unlock")
    public ResponseEntity<String> unlockAccount(@RequestParam String email, @RequestParam String token) {
        userService.unlockAccount(email, token);
        return ResponseEntity.ok("Account unlocked. You can now log in.");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseToken> refreshToken(@RequestParam String refreshToken) {
        return ResponseEntity.ok(userService.refreshToken(refreshToken));
    }
}