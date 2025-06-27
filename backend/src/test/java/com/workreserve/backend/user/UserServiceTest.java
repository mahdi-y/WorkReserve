package com.workreserve.backend.user;

import com.workreserve.backend.config.JwtService;
import com.workreserve.backend.user.DTO.RegisterRequest;
import com.workreserve.backend.user.DTO.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getUserById_found() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        UserResponse res = userService.getUserById(1L);
        assertEquals(1L, res.getId());
    }

    @Test
    void getUserById_notFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.getUserById(1L));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void registerUser_success() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtService.generateToken("test@example.com")).thenReturn("token");

        var res = userService.registerUser(req);
        assertEquals("token", res.getToken());
    }

    @Test
    void registerUser_emailExists() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new User()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.registerUser(req));
        assertEquals("Email already in use", ex.getMessage());
    }

    @Test
    void updateUser_success() {
        User user = new User();
        user.setId(1L);
        user.setEmail("old@example.com");
        user.setPassword("oldpass");

        RegisterRequest req = new RegisterRequest();
        req.setFullName("New Name");
        req.setEmail("new@example.com");
        req.setPassword("newpass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("newpass")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponse res = userService.updateUser(1L, req);
        assertEquals("New Name", res.getFullName());
        assertEquals("new@example.com", res.getEmail());
    }

    @Test
    void updateUser_notFound() {
        RegisterRequest req = new RegisterRequest();
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.updateUser(1L, req));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void updateUser_emailExists() {
        User user = new User();
        user.setId(1L);
        user.setEmail("old@example.com");

        RegisterRequest req = new RegisterRequest();
        req.setFullName("New Name");
        req.setEmail("existing@example.com");
        req.setPassword("newpass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.updateUser(1L, req));
        assertEquals("Email already in use", ex.getMessage());
    }

    @Test
    void deleteUser_success() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        doNothing().when(userRepository).delete(user);
        assertDoesNotThrow(() -> userService.deleteUser(1L));
    }

    @Test
    void deleteUser_notFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.deleteUser(1L));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void updateUserRole_success() {
        User user = new User();
        user.setId(1L);
        user.setRole(Role.USER);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        var res = userService.updateUserRole(1L, Role.ADMIN);
        assertEquals(Role.ADMIN, res.getRole());
    }

    @Test
    void updateUserRole_notFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.updateUserRole(1L, Role.ADMIN));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void toggleUserStatus_success() {
        User user = new User();
        user.setId(1L);
        user.setEnabled(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        var res = userService.toggleUserStatus(1L);
        assertFalse(res.isEnabled());
    }

    @Test
    void toggleUserStatus_notFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.toggleUserStatus(1L));
        assertEquals("User not found", ex.getMessage());
    }
}