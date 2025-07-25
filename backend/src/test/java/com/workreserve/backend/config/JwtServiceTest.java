package com.workreserve.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private JwtService jwtService;
    private String testSecret = "mySecretKeyThatIsMuchLongerThanRequiredForHmacSha256";
    private long testExpiration = 86400000L; // 24 hours

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(testSecret, testExpiration);
    }

    @Test
    void generateToken_ValidEmail_ReturnsToken() {
        String email = "test@example.com";
        
        String token = jwtService.generateToken(email);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.contains("."));
    }

    @Test
    void extractEmail_ValidToken_ReturnsEmail() {
        String email = "test@example.com";
        String token = jwtService.generateToken(email);
        
        String extractedEmail = jwtService.extractEmail(token);
        
        assertEquals(email, extractedEmail);
    }

    @Test
    void generateToken_DifferentEmails_ReturnsDifferentTokens() {
        String email1 = "user1@example.com";
        String email2 = "user2@example.com";
        
        String token1 = jwtService.generateToken(email1);
        String token2 = jwtService.generateToken(email2);
        
        assertNotEquals(token1, token2);
    }

    @Test
    void extractEmail_InvalidToken_ThrowsException() {
        String invalidToken = "invalid.token.here";
        
        assertThrows(Exception.class, () -> {
            jwtService.extractEmail(invalidToken);
        });
    }

    @Test
    void generateToken_NullEmail_ThrowsException() {
        assertThrows(Exception.class, () -> {
            jwtService.generateToken(null);
        });
    }

    @Test
    void generateToken_EmptyEmail_GeneratesToken() {
        String token = jwtService.generateToken("");
        
        assertNotNull(token);
        assertEquals("", jwtService.extractEmail(token));
    }

    @Test
    void tokenContainsExpiration_ValidToken_HasFutureExpiration() {
        String email = "test@example.com";
        String token = jwtService.generateToken(email);
        
        // Extract expiration manually to test
        Key key = Keys.hmacShaKeyFor(testSecret.getBytes());
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void constructor_InitializesCorrectly() {
        JwtService service = new JwtService("anotherSecret", 3600000L);
        
        assertNotNull(service);
        String token = service.generateToken("test@example.com");
        assertNotNull(token);
    }
}