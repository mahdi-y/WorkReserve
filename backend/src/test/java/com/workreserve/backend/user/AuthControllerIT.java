package com.workreserve.backend.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workreserve.backend.reservation.ReservationRepository;
import com.workreserve.backend.user.DTO.LoginRequest;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.ForgotPasswordRequest;
import com.workreserve.backend.user.DTO.ResetPasswordRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @BeforeEach
    void cleanDb() {
        reservationRepository.deleteAll();
        userRepository.deleteAll();
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
        
        User user = new User();
        user.setFullName("Existing");
        user.setEmail("exists@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        userRepository.save(user);

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
        User user = new User();
        user.setFullName("Login User");
        user.setEmail("login@example.com");

        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        user.setPassword(encoder.encode("password123"));
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

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
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void login_shouldReturnBadRequest_whenEmailNotVerified() throws Exception {
        User user = new User();
        user.setFullName("Unverified User");
        user.setEmail("unverified@example.com");
        
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        user.setPassword(encoder.encode("password123"));
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(false); 
        userRepository.save(user);

        LoginRequest req = new LoginRequest();
        req.setEmail("unverified@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email not verified. Please check your inbox."));
    }

    @Test
    void login_shouldReturnBadRequest_whenAccountLocked() throws Exception {
        User user = new User();
        user.setFullName("Locked User");
        user.setEmail("locked@example.com");
        
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        user.setPassword(encoder.encode("password123"));
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(true);
        user.setLocked(true); 
        userRepository.save(user);

        LoginRequest req = new LoginRequest();
        req.setEmail("locked@example.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Account is locked. Please check your email to unlock."));
    }

    @Test
    void refreshToken_shouldReturnNewTokens_whenValid() throws Exception {
        
        User user = new User();
        user.setFullName("Refresh User");
        user.setEmail("refresh@example.com");
        
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        user.setPassword(encoder.encode("password123"));
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

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
        User user = new User();
        user.setFullName("Verify User");
        user.setEmail("verify@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        user.setEnabled(true);
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
        User user = new User();
        user.setFullName("Resend User");
        user.setEmail("resend@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(false);
        userRepository.save(user);

        mockMvc.perform(post("/api/auth/resend-verification?email=resend@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("Verification email resent if the account exists."));
    }

    @Test
    void forgotPassword_shouldReturnOk() throws Exception {
        User user = new User();
        user.setFullName("Forgot User");
        user.setEmail("forgot@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

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
        User user = new User();
        user.setFullName("Reset User");
        user.setEmail("reset@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(true);
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
        User user = new User();
        user.setFullName("Unlock User");
        user.setEmail("unlock@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(true);
        user.setLocked(true);
        user.setUnlockToken("unlock-token");
        user.setUnlockTokenCreatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        mockMvc.perform(post("/api/auth/unlock?email=unlock@example.com&token=unlock-token"))
                .andExpect(status().isOk())
                .andExpect(content().string("Account unlocked. You can now log in."));
    }

    @Test
    void unlockAccount_shouldReturnBadRequest_whenInvalidToken() throws Exception {
        mockMvc.perform(post("/api/auth/unlock?email=test@example.com&token=invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
}