package com.workreserve.backend.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workreserve.backend.reservation.ReservationRepository;
import com.workreserve.backend.user.DTO.LoginRequest;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.ForgotPasswordRequest;
import com.workreserve.backend.user.DTO.ResetPasswordRequest;
import com.workreserve.backend.activity.ActivityRepository;
import com.workreserve.backend.config.TestConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;


import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class) 
class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    
    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @BeforeEach
    void cleanDb() {
        try {
            
            reservationRepository.deleteAll();
            activityRepository.deleteAll();
            userRepository.deleteAll();
            
            
            if (entityManager != null) {
                entityManager.flush();
                entityManager.clear();
            }
        } catch (Exception e) {
            
            System.out.println("Cleanup warning: " + e.getMessage());
        }
    }

    @Test
    void register_shouldReturnToken_whenValid() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Auth User");
        req.setEmail("auth@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists()); 
    }

    @Test
    void register_shouldReturnBadRequest_whenEmailExists() throws Exception {
        
        createTestUser("Existing", "exists@example.com", "password123");

        RegisterRequest req = new RegisterRequest();
        req.setFullName("New User");
        req.setEmail("exists@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already in use"));
    }

    @Test
    void login_shouldReturnToken_whenValid() throws Exception {
        
        createTestUser("Login User", "login@example.com", "password123");

        LoginRequest req = new LoginRequest();
        req.setEmail("login@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void login_shouldReturnBadRequest_whenInvalidCredentials() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("notfound@example.com");
        req.setPassword("wrongpass");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized()) 
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void login_shouldReturnBadRequest_whenEmailNotVerified() throws Exception {
        
        User user = createTestUser("Unverified User", "unverified@example.com", "password123");
        user.setEmailVerified(false);
        userRepository.save(user);

        LoginRequest req = new LoginRequest();
        req.setEmail("unverified@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized()) 
                .andExpect(jsonPath("$.message").value("Email not verified. Please check your inbox."));
    }

    @Test
    void login_shouldReturnBadRequest_whenAccountLocked() throws Exception {
        
        User user = createTestUser("Locked User", "locked@example.com", "password123");
        user.setLocked(true);
        userRepository.save(user);

        LoginRequest req = new LoginRequest();
        req.setEmail("locked@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized()) 
                .andExpect(jsonPath("$.message").value("Account is locked. Please check your email to unlock."));
    }

    @Test
    void refreshToken_shouldReturnNewTokens_whenValid() throws Exception {
        
        User user = createTestUser("Refresh User", "refresh@example.com", "password123");

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("refresh@example.com");
        loginReq.setPassword("password123");

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String refreshToken = objectMapper.readTree(loginResponse).get("refreshToken").asText();

        mockMvc.perform(post("/api/auth/refresh-token?refreshToken=" + refreshToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void refreshToken_shouldReturnBadRequest_whenInvalidToken() throws Exception {
        mockMvc.perform(post("/api/auth/refresh-token?refreshToken=invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid refresh token."));
    }

    @Test
    void verifyEmail_shouldReturnOk_whenValidToken() throws Exception {
        
        User user = createTestUser("Verify User", "verify@example.com", "password123");
        user.setEmailVerified(false);
        user.setVerificationToken("valid-token");
        user.setVerificationTokenCreatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        mockMvc.perform(get("/api/auth/verify?token=valid-token"))
                .andExpect(status().isOk())
                .andExpect(content().string("Email verified successfully."));
    }

    @Test
    void verifyEmail_shouldReturnBadRequest_whenInvalidToken() throws Exception {
        mockMvc.perform(get("/api/auth/verify?token=invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void resendVerification_shouldReturnOk() throws Exception {
        
        User user = createTestUser("Resend User", "resend@example.com", "password123");
        user.setEmailVerified(false);
        userRepository.save(user);

        mockMvc.perform(post("/api/auth/resend-verification?email=resend@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("Verification email resent if the account exists."));
    }

    @Test
    void forgotPassword_shouldReturnOk() throws Exception {
        
        createTestUser("Forgot User", "forgot@example.com", "password123");

        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("forgot@example.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string("If an account with that email exists, a password reset link has been sent."));
    }

    @Test
    void resetPassword_shouldReturnOk_whenValidToken() throws Exception {
        
        User user = createTestUser("Reset User", "reset@example.com", "password123");
        user.setResetPasswordToken("reset-token");
        user.setResetPasswordTokenCreatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("reset-token");
        req.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string("Password has been reset successfully."));
    }

    @Test
    void resetPassword_shouldReturnBadRequest_whenInvalidToken() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("invalid-token");
        req.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
void unlockAccount_shouldReturnOk_whenValidToken() throws Exception {
    
    User user = createTestUser("Unlock User", "unlock@example.com", "password123");
    user.setLocked(true);
    user.setUnlockToken("unlock-token");
    user.setUnlockTokenCreatedAt(java.time.LocalDateTime.now());
    userRepository.save(user);

    mockMvc.perform(post("/api/auth/unlock?email=unlock@example.com&token=unlock-token"))
            .andExpect(status().isOk())
            .andExpect(content().string("Account unlocked successfully.")); 
}

    @Test
    void unlockAccount_shouldReturnBadRequest_whenInvalidToken() throws Exception {
        mockMvc.perform(post("/api/auth/unlock?email=test@example.com&token=invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("User not found")); 
    }

    
    private User createTestUser(String fullName, String email, String password) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); 
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setLocked(false);
        user.setBanned(false);
        user.setEmailVerified(true); 
        user.setTwoFactorEnabled(false);
        user.setFailedLoginAttempts(0);
        return userRepository.save(user);
    }
}