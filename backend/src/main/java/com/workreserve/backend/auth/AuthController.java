package com.workreserve.backend.auth;

import com.workreserve.backend.user.UserService;
import com.workreserve.backend.user.DTO.AuthResponse;
import com.workreserve.backend.user.DTO.AuthResponseToken;
import com.workreserve.backend.user.DTO.ForgotPasswordRequest;
import com.workreserve.backend.user.DTO.LoginRequest;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.ResetPasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and user management endpoints")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Register a new user", description = "Create a new user account with email verification")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User registered successfully",
                content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Email already exists or validation error"),
        @ApiResponse(responseCode = "429", description = "Too many registration attempts")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @Operation(summary = "Login user", description = "Authenticate user and return access & refresh tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful",
                content = @Content(schema = @Schema(implementation = AuthResponseToken.class))),
        @ApiResponse(responseCode = "400", description = "Invalid credentials or account locked"),
        @ApiResponse(responseCode = "429", description = "Too many login attempts")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponseToken> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.loginUser(request));
    }

    @Operation(summary = "Verify email", description = "Verify user email address with the provided token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email verified successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully.");
    }

    @Operation(summary = "Resend verification email", description = "Resend the email verification link to the user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verification email resent if the account exists."),
        @ApiResponse(responseCode = "400", description = "Invalid email address")
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam String email) {
        userService.resendVerificationEmail(email);
        return ResponseEntity.ok("Verification email resent if the account exists.");
    }

    @Operation(summary = "Request password reset", description = "Send a password reset link to the user's email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset link sent if the account exists."),
        @ApiResponse(responseCode = "400", description = "Invalid email address")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("If an account with that email exists, a password reset link has been sent.");
    }

    @Operation(summary = "Reset password", description = "Reset the user's password using the provided token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password has been reset successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid token or password")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password has been reset successfully.");
    }

    @Operation(summary = "Unlock user account", description = "Unlock a locked user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account unlocked. You can now log in."),
        @ApiResponse(responseCode = "400", description = "Invalid email or token")
    })
    @PostMapping("/unlock")
    public ResponseEntity<String> unlockAccount(@RequestParam String email, @RequestParam String token) {
        userService.unlockAccount(email, token);
        return ResponseEntity.ok("Account unlocked. You can now log in.");
    }

    @Operation(summary = "Refresh access token", description = "Get new access and refresh tokens using refresh token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseToken> refreshToken(@RequestParam String refreshToken) {
        return ResponseEntity.ok(userService.refreshToken(refreshToken));
    }
}