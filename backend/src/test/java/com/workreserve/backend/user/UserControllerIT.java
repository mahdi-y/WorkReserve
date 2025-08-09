package com.workreserve.backend.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workreserve.backend.user.DTO.ChangePasswordRequest;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.UpdateRoleRequest;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
class UserControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PersistenceContext
    private EntityManager entityManager;

    @BeforeEach
    void cleanDb() {
        try {
            
            activityRepository.deleteAll();
            userRepository.deleteAll();
            
            
            entityManager.flush();
            entityManager.clear();
        } catch (Exception e) {
            
            System.out.println("Cleanup warning: " + e.getMessage());
        }
    }

    @Test
    void contextLoads() {
        
        org.junit.jupiter.api.Assertions.assertNotNull(mockMvc);
        org.junit.jupiter.api.Assertions.assertNotNull(userRepository);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_shouldReturnOk() throws Exception {
        
        createTestUser("Test User", "test@example.com", "password123");

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].email").value("test@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAndGetUserById_shouldReturnOk() throws Exception {
        
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("password123");

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword());
        user.setRole(Role.USER);
        userRepository.save(user);

        Long id = user.getId();

        mockMvc.perform(get("/api/users/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUser_shouldReturnOk() throws Exception {
        User user = new User();
        user.setFullName("Old Name");
        user.setEmail("old@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        userRepository.save(user);

        RegisterRequest req = new RegisterRequest();
        req.setFullName("New Name");
        req.setEmail("new@example.com");
        req.setPassword("newpassword123");

        mockMvc.perform(put("/api/users/" + user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("New Name"))
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteUser_shouldReturnNoContent() throws Exception {
        User user = new User();
        user.setFullName("Delete Me");
        user.setEmail("deleteme@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        userRepository.save(user);

        mockMvc.perform(delete("/api/users/" + user.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUserRole_shouldReturnOk() throws Exception {
        User user = new User();
        user.setFullName("Role User");
        user.setEmail("roleuser@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        userRepository.save(user);

        UpdateRoleRequest req = new UpdateRoleRequest();
        req.setRole(Role.ADMIN);

        mockMvc.perform(put("/api/users/" + user.getId() + "/role")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void toggleUserStatus_shouldReturnOk() throws Exception {
        User user = new User();
        user.setFullName("Toggle User");
        user.setEmail("toggle@example.com");
        user.setPassword("password123");
        user.setRole(Role.USER);
        user.setEnabled(true);
        userRepository.save(user);

        mockMvc.perform(put("/api/users/" + user.getId() + "/toggle-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
    }

    
    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserById_shouldReturnBadRequest_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/users/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUser_shouldReturnBadRequest_whenNotFound() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Name");
        req.setEmail("email@example.com");
        req.setPassword("password123");

        mockMvc.perform(put("/api/users/99999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteUser_shouldReturnBadRequest_whenNotFound() throws Exception {
        mockMvc.perform(delete("/api/users/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUser_shouldReturnBadRequest_whenEmailExists() throws Exception {
        
        User user1 = new User();
        user1.setFullName("User1");
        user1.setEmail("user1@example.com");
        user1.setPassword("password123");
        user1.setRole(Role.USER);
        userRepository.save(user1);

        User user2 = new User();
        user2.setFullName("User2");
        user2.setEmail("user2@example.com");
        user2.setPassword("password123");
        user2.setRole(Role.USER);
        userRepository.save(user2);

        
        RegisterRequest req = new RegisterRequest();
        req.setFullName("User1 Updated");
        req.setEmail("user2@example.com");
        req.setPassword("password123");

        mockMvc.perform(put("/api/users/" + user1.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already in use"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllUsers_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isBadRequest()) 
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getUserById_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isBadRequest()) 
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void updateUser_shouldReturnForbidden_whenNotAdmin() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Name");
        req.setEmail("email@example.com");
        req.setPassword("password123");

        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest()) 
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void deleteUser_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isBadRequest()) 
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void banUser_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(put("/api/users/1/ban"))
                .andExpect(status().isBadRequest()) 
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    void getCurrentUser_shouldReturnUnauthorized_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isForbidden()); 
    }

    @Test
    void changePassword_shouldReturnUnauthorized_whenNotAuthenticated() throws Exception {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setOldPassword("old");
        req.setNewPassword("new12345678");

        mockMvc.perform(put("/api/users/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden()); 
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