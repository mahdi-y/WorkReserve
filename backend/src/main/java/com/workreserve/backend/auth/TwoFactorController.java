package com.workreserve.backend.auth;

import com.workreserve.backend.auth.DTO.*;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserService;
import com.workreserve.backend.user.DTO.AuthResponseToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/2fa")
@Tag(name = "Two-Factor Authentication", description = "2FA management endpoints")
public class TwoFactorController {

    @Autowired
    private TwoFactorService twoFactorService;

    @Autowired
    private UserService userService;

    @Operation(summary = "Check if 2FA is required for login")
    @PostMapping("/check")
    public ResponseEntity<Map<String, Boolean>> check2FARequired(@RequestParam String email) {
        boolean required = userService.requiresTwoFactor(email);
        return ResponseEntity.ok(Map.of("twoFactorRequired", required));
    }

    @Operation(summary = "Login with 2FA")
    @PostMapping("/login")
    public ResponseEntity<AuthResponseToken> loginWith2FA(@Valid @RequestBody TwoFactorLoginRequest request) {
        return ResponseEntity.ok(userService.loginUserWith2FA(request));
    }

    @Operation(summary = "Setup 2FA - Generate QR code")
    @PostMapping("/setup")
    public ResponseEntity<TwoFactorSetupResponse> setup2FA(@AuthenticationPrincipal User user) {
        String secret = twoFactorService.generateSecret();
        String otpAuthUri = twoFactorService.generateOtpAuthUri(user, secret);
        List<String> backupCodes = twoFactorService.generateBackupCodes();

        return ResponseEntity.ok(new TwoFactorSetupResponse(secret, otpAuthUri, backupCodes));
    }

    @Operation(summary = "Enable 2FA")
    @PostMapping("/enable")
    public ResponseEntity<Map<String, Object>> enable2FA(
            @AuthenticationPrincipal User user,
            @RequestParam String secret,
            @Valid @RequestBody TwoFactorVerificationRequest request) {
        
        List<String> backupCodes = twoFactorService.enableTwoFactor(user, secret, request.getCode());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Two-factor authentication enabled successfully");
        response.put("backupCodes", backupCodes);
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Disable 2FA")
    @PostMapping("/disable")
    public ResponseEntity<String> disable2FA(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorVerificationRequest request) {
        
        twoFactorService.disableTwoFactor(user, request.getCode());
        return ResponseEntity.ok("Two-factor authentication disabled successfully");
    }

    @Operation(summary = "Get backup codes")
    @GetMapping("/backup-codes")
    public ResponseEntity<List<String>> getBackupCodes(@AuthenticationPrincipal User user) {
        if (!user.getTwoFactorEnabled()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<String> codes = twoFactorService.getBackupCodes(user);
        return ResponseEntity.ok(codes);
    }

    @Operation(summary = "Regenerate backup codes")
    @PostMapping("/backup-codes/regenerate")
    public ResponseEntity<List<String>> regenerateBackupCodes(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorVerificationRequest request) {
        
        List<String> newCodes = twoFactorService.regenerateBackupCodes(user, request.getCode());
        return ResponseEntity.ok(newCodes);
    }

    @Operation(summary = "Verify 2FA code")
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verify2FA(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorVerificationRequest request) {
        
        boolean valid = twoFactorService.verifyCode(user.getTwoFactorSecret(), request.getCode());
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}