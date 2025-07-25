package com.workreserve.backend.activity;

import com.workreserve.backend.activity.DTO.ActivityResponse;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;
    
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ActivityService activityService;

    private User testUser;
    private Activity testActivity;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");

        testActivity = new Activity();
        testActivity.setId(1L);
        testActivity.setAction("LOGIN");
        testActivity.setEntityType("USER");
        testActivity.setEntityId(1L);
        testActivity.setEntityName("Test User");
        testActivity.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void logActivity_WithEmail_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(activityRepository.save(any(Activity.class))).thenReturn(testActivity);

        assertDoesNotThrow(() -> 
            activityService.logActivity("test@example.com", "LOGIN", "USER", 1L, "Test User")
        );

        verify(userRepository).findByEmail("test@example.com");
        verify(activityRepository).save(any(Activity.class));
    }

    @Test
    void logActivity_WithUserId_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(activityRepository.save(any(Activity.class))).thenReturn(testActivity);

        assertDoesNotThrow(() -> 
            activityService.logActivity(1L, "LOGIN", "USER", 1L, "Test User")
        );

        verify(userRepository).findById(1L);
        verify(activityRepository).save(any(Activity.class));
    }

    @Test
    void logActivity_UserNotFound_NoError() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> 
            activityService.logActivity("nonexistent@example.com", "LOGIN", "USER", 1L, "Test User")
        );

        verify(userRepository).findByEmail("nonexistent@example.com");
        verify(activityRepository, never()).save(any(Activity.class));
    }

    @Test
    void getRecentActivityForUser_WithEmail_Success() {
        List<Activity> activities = Arrays.asList(testActivity);
        Pageable pageable = PageRequest.of(0, 10);

        when(activityRepository.findByUserEmailOrderByCreatedAtDesc("test@example.com", pageable))
            .thenReturn(activities);

        List<ActivityResponse> result = activityService.getRecentActivityForUser("test@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(activityRepository).findByUserEmailOrderByCreatedAtDesc("test@example.com", pageable);
    }

    @Test
    void getRecentActivityForUser_WithUserId_Success() {
        List<Activity> activities = Arrays.asList(testActivity);
        Pageable pageable = PageRequest.of(0, 10);

        when(activityRepository.findByUserIdOrderByCreatedAtDesc(1L, pageable))
            .thenReturn(activities);

        List<ActivityResponse> result = activityService.getRecentActivityForUser(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(activityRepository).findByUserIdOrderByCreatedAtDesc(1L, pageable);
    }

    @Test
    void toActivityResponse_Success() {
        // Use reflection to access private method
        ActivityResponse response = ReflectionTestUtils.invokeMethod(activityService, "toActivityResponse", testActivity);

        assertNotNull(response);
        assertEquals(testActivity.getId(), response.getId());
        assertEquals(testActivity.getAction(), response.getAction());
        assertEquals(testActivity.getEntityType(), response.getEntityType());
        assertEquals(testActivity.getEntityId(), response.getEntityId());
        assertEquals(testActivity.getEntityName(), response.getEntityName());
        assertEquals(testActivity.getCreatedAt(), response.getCreatedAt());
    }
}