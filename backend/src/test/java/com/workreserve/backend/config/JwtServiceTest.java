package com.workreserve.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private SecretKey secretKey;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        userDetails = new User("test@example.com", "password", Collections.emptyList());
        
        // Set the secret key using reflection
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L); // 24 hours
    }

    @Test
    void generateToken_WithUsername_Success() {
        String token = jwtService.generateToken("test@example.com");

        assertNotNull(token);
        assertFalse(token.isEmpty());
        
        // Verify the token contains the username
        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("test@example.com", extractedUsername);
    }

    @Test
    void generateToken_WithUserDetails_Success() {
        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        
        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("test@example.com", extractedUsername);
    }

    @Test
    void extractUsername_ValidToken_ReturnsUsername() {
        String token = jwtService.generateToken("test@example.com");
        
        String username = jwtService.extractUsername(token);
        
        assertEquals("test@example.com", username);
    }

    @Test
    void extractExpiration_ValidToken_ReturnsExpiration() {
        String token = jwtService.generateToken("test@example.com");
        
        Date expiration = jwtService.extractExpiration(token);
        
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void isTokenValid_ValidToken_ReturnsTrue() {
        String token = jwtService.generateToken("test@example.com");
        
        boolean isValid = jwtService.isTokenValid(token, userDetails);
        
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_InvalidUsername_ReturnsFalse() {
        String token = jwtService.generateToken("different@example.com");
        
        boolean isValid = jwtService.isTokenValid(token, userDetails);
        
        assertFalse(isValid);
    }

    @Test
    void isTokenValid_ExpiredToken_ReturnsFalse() {
        // Create an expired token
        Date expiredDate = new Date(System.currentTimeMillis() - 1000); // 1 second ago
        String expiredToken = Jwts.builder()
            .setSubject("test@example.com")
            .setIssuedAt(new Date(System.currentTimeMillis() - 2000))
            .setExpiration(expiredDate)
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();

        boolean isValid = jwtService.isTokenValid(expiredToken, userDetails);
        
        assertFalse(isValid);
    }

    @Test
    void isTokenExpired_ValidToken_ReturnsFalse() {
        String token = jwtService.generateToken("test@example.com");
        
        boolean isExpired = jwtService.isTokenExpired(token);
        
        assertFalse(isExpired);
    }

    @Test
    void isTokenExpired_ExpiredToken_ReturnsTrue() {
        // Create an expired token
        Date expiredDate = new Date(System.currentTimeMillis() - 1000);
        String expiredToken = Jwts.builder()
            .setSubject("test@example.com")
            .setIssuedAt(new Date(System.currentTimeMillis() - 2000))
            .setExpiration(expiredDate)
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();

        boolean isExpired = jwtService.isTokenExpired(expiredToken);
        
        assertTrue(isExpired);
    }

    @Test
    void extractAllClaims_ValidToken_ReturnsClaims() {
        String token = jwtService.generateToken("test@example.com");
        
        // Use reflection to access private method
        Claims claims = ReflectionTestUtils.invokeMethod(jwtService, "extractAllClaims", token);
        
        assertNotNull(claims);
        assertEquals("test@example.com", claims.getSubject());
    }

    @Test
    void generateToken_WithAdditionalClaims_Success() {
        java.util.Map<String, Object> extraClaims = java.util.Map.of(
            "role", "ADMIN",
            "userId", 123L
        );
        
        String token = ReflectionTestUtils.invokeMethod(jwtService, "generateToken", extraClaims, userDetails);
        
        assertNotNull(token);
        
        Claims claims = ReflectionTestUtils.invokeMethod(jwtService, "extractAllClaims", token);
        assertEquals("ADMIN", claims.get("role"));
        assertEquals(123, claims.get("userId"));
    }

    @Test
    void extractClaim_WithCustomExtractor_Success() {
        String token = jwtService.generateToken("test@example.com");
        
        String subject = ReflectionTestUtils.invokeMethod(jwtService, "extractClaim", token, Claims::getSubject);
        
        assertEquals("test@example.com", subject);
    }

    @Test
    void generateToken_NullUsername_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            jwtService.generateToken((String) null);
        });
    }

    @Test
    void generateToken_EmptyUsername_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            jwtService.generateToken("");
        });
    }

    @Test
    void extractUsername_InvalidToken_ThrowsException() {
        String invalidToken = "invalid.token.here";
        
        assertThrows(Exception.class, () -> {
            jwtService.extractUsername(invalidToken);
        });
    }

    @Test
    void isTokenValid_NullToken_ReturnsFalse() {
        boolean isValid = jwtService.isTokenValid(null, userDetails);
        
        assertFalse(isValid);
    }

    @Test
    void isTokenValid_NullUserDetails_ReturnsFalse() {
        String token = jwtService.generateToken("test@example.com");
        
        boolean isValid = jwtService.isTokenValid(token, null);
        
        assertFalse(isValid);
    }
}