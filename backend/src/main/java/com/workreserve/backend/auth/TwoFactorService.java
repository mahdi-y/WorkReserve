package com.workreserve.backend.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.exception.UserException;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TwoFactorService {

    @Autowired
    private UserRepository userRepository;

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider(); 
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public String generateOtpAuthUri(User user, String secret) {
    return String.format(
        "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
        "WorkReserve",
        user.getEmail(),
        secret,
        "WorkReserve"
    );
}

    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null) {
            return false;
        }
        return codeVerifier.isValidCode(secret, code);
    }

    public List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            codes.add(UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
        }
        return codes;
    }

    public boolean useBackupCode(User user, String code) {
        try {
            if (user.getBackupCodes() == null || user.getBackupCodes().isEmpty()) {
                return false;
            }
            
            List<String> backupCodes = objectMapper.readValue(
                user.getBackupCodes(), 
                new TypeReference<List<String>>() {}
            );
            
            if (backupCodes.remove(code.toUpperCase())) {
                user.setBackupCodes(objectMapper.writeValueAsString(backupCodes));
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
    public void enableTwoFactor(User user, String secret, String verificationCode) {
        if (!verifyCode(secret, verificationCode)) {
            throw new UserException("Invalid verification code");
        }

        List<String> backupCodes = generateBackupCodes();
        
        try {
            user.setTwoFactorSecret(secret);
            user.setTwoFactorEnabled(true);
            user.setTwoFactorEnabledAt(LocalDateTime.now());
            user.setBackupCodes(objectMapper.writeValueAsString(backupCodes));
            userRepository.save(user);
        } catch (Exception e) {
            throw new UserException("Failed to enable 2FA: " + e.getMessage());
        }
    }

    @CacheEvict(value = {"users", "current-user"}, allEntries = true)
    public void disableTwoFactor(User user, String verificationCode) {
        if (user.getTwoFactorSecret() == null) {
            throw new UserException("2FA is not enabled");
        }
        
        if (!verifyCode(user.getTwoFactorSecret(), verificationCode) && 
            !useBackupCode(user, verificationCode)) {
            throw new UserException("Invalid verification code");
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setBackupCodes(null);
        user.setTwoFactorEnabledAt(null);
        userRepository.save(user);
    }

    public List<String> getBackupCodes(User user) {
        try {
            if (user.getBackupCodes() == null || user.getBackupCodes().isEmpty()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(
                user.getBackupCodes(), 
                new TypeReference<List<String>>() {}
            );
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public List<String> regenerateBackupCodes(User user, String verificationCode) {
        if (user.getTwoFactorSecret() == null) {
            throw new UserException("2FA is not enabled");
        }
        
        if (!verifyCode(user.getTwoFactorSecret(), verificationCode)) {
            throw new UserException("Invalid verification code");
        }

        List<String> newCodes = generateBackupCodes();
        try {
            user.setBackupCodes(objectMapper.writeValueAsString(newCodes));
            userRepository.save(user);
            return newCodes;
        } catch (Exception e) {
            throw new UserException("Failed to regenerate backup codes: " + e.getMessage());
        }
    }
}