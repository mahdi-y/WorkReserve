package com.workreserve.backend.auth;

import com.workreserve.backend.auth.DTO.*;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.config.JwtService;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.qr.QrGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TwoFactorServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private SecretGenerator secretGenerator;
    
    @Mock
    private QrGenerator qrGenerator;
    
    @Mock
    private CodeGenerator codeGenerator;
    
    @Mock
    private CodeVerifier codeVerifier;
    
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private TwoFactorService twoFactorService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setTwoFactorEnabled(false);
        testUser.setTwoFactorSecret(null);

        // Set up security context
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("test@example.com", null)
        );
    }

    @Test
    void generateTwoFactorSetup_Success() {
        String mockSecret = "ABCDEFGHIJKLMNOP";
        String mockQrCode = "data:image/png;base64,mockQrCode";

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(secretGenerator.generate()).thenReturn(mockSecret);
        when(qrGenerator.generate(any())).thenReturn(mockQrCode);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        TwoFactorSetupResponse response = twoFactorService.generateTwoFactorSetup();

        assertNotNull(response);
        assertEquals(mockSecret, response.getSecret());
        assertEquals(mockQrCode, response.getQrCodeUrl());
        verify(userRepository).save(testUser);
        assertEquals(mockSecret, testUser.getTwoFactorSecret());
    }

    @Test
    void enableTwoFactor_Success() {
        String secret = "ABCDEFGHIJKLMNOP";
        String code = "123456";
        testUser.setTwoFactorSecret(secret);

        TwoFactorVerificationRequest request = new TwoFactorVerificationRequest();
        request.setCode(code);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(codeVerifier.isValidCode(secret, code)).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertDoesNotThrow(() -> twoFactorService.enableTwoFactor(request));

        assertTrue(testUser.isTwoFactorEnabled());
        verify(userRepository).save(testUser);
    }

    @Test
    void enableTwoFactor_InvalidCode() {
        String secret = "ABCDEFGHIJKLMNOP";
        String code = "123456";
        testUser.setTwoFactorSecret(secret);

        TwoFactorVerificationRequest request = new TwoFactorVerificationRequest();
        request.setCode(code);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(codeVerifier.isValidCode(secret, code)).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> twoFactorService.enableTwoFactor(request));

        assertFalse(testUser.isTwoFactorEnabled());
        verify(userRepository, never()).save(testUser);
    }

    @Test
    void disableTwoFactor_Success() {
        testUser.setTwoFactorEnabled(true);
        testUser.setTwoFactorSecret("ABCDEFGHIJKLMNOP");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertDoesNotThrow(() -> twoFactorService.disableTwoFactor());

        assertFalse(testUser.isTwoFactorEnabled());
        assertNull(testUser.getTwoFactorSecret());
        verify(userRepository).save(testUser);
    }

    @Test
    void verifyTwoFactorLogin_Success() {
        String secret = "ABCDEFGHIJKLMNOP";
        String code = "123456";
        String token = "jwt-token";
        testUser.setTwoFactorEnabled(true);
        testUser.setTwoFactorSecret(secret);

        TwoFactorLoginRequest request = new TwoFactorLoginRequest();
        request.setEmail("test@example.com");
        request.setCode(code);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(codeVerifier.isValidCode(secret, code)).thenReturn(true);
        when(jwtService.generateToken("test@example.com")).thenReturn(token);

        String result = twoFactorService.verifyTwoFactorLogin(request);

        assertEquals(token, result);
        verify(jwtService).generateToken("test@example.com");
    }

    @Test
    void verifyTwoFactorLogin_InvalidCode() {
        String secret = "ABCDEFGHIJKLMNOP";
        String code = "123456";
        testUser.setTwoFactorEnabled(true);
        testUser.setTwoFactorSecret(secret);

        TwoFactorLoginRequest request = new TwoFactorLoginRequest();
        request.setEmail("test@example.com");
        request.setCode(code);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(codeVerifier.isValidCode(secret, code)).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> twoFactorService.verifyTwoFactorLogin(request));
    }

    @Test
    void verifyTwoFactorLogin_UserNotFound() {
        TwoFactorLoginRequest request = new TwoFactorLoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setCode("123456");

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> twoFactorService.verifyTwoFactorLogin(request));
    }

    @Test
    void verifyTwoFactorLogin_TwoFactorNotEnabled() {
        String code = "123456";
        testUser.setTwoFactorEnabled(false);

        TwoFactorLoginRequest request = new TwoFactorLoginRequest();
        request.setEmail("test@example.com");
        request.setCode(code);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(BadCredentialsException.class, () -> twoFactorService.verifyTwoFactorLogin(request));
    }

    @Test
    void generateTwoFactorSetup_UserNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> twoFactorService.generateTwoFactorSetup());
    }

    @Test
    void enableTwoFactor_UserNotFound() {
        TwoFactorVerificationRequest request = new TwoFactorVerificationRequest();
        request.setCode("123456");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> twoFactorService.enableTwoFactor(request));
    }

    @Test
    void disableTwoFactor_UserNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> twoFactorService.disableTwoFactor());
    }
}