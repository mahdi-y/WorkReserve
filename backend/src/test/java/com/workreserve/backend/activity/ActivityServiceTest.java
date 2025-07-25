package com.workreserve.backend.activity;

import com.workreserve.backend.activity.DTO.ActivityResponse;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

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
        testActivity.setUserId(1L);
        testActivity.setAction("LOGIN");
        testActivity.setResource("USER");
        testActivity.setTimestamp(LocalDateTime.now());
        testActivity.setDetails("User logged in successfully");
    }

    @Test
    void logActivity_Success() {
        when(activityRepository.save(any(Activity.class))).thenReturn(testActivity);

        assertDoesNotThrow(() -> 
            activityService.logActivity(1L, "LOGIN", "USER", 1L, "User logged in")
        );

        verify(activityRepository).save(any(Activity.class));
    }

    @Test
    void getAllActivities_Success() {
        List<Activity> activities = Arrays.asList(testActivity);
        Page<Activity> page = new PageImpl<>(activities);
        Pageable pageable = PageRequest.of(0, 10);

        when(activityRepository.findAllByOrderByTimestampDesc(pageable)).thenReturn(page);

        Page<ActivityResponse> result = activityService.getAllActivities(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("LOGIN", result.getContent().get(0).getAction());
        verify(activityRepository).findAllByOrderByTimestampDesc(pageable);
    }

    @Test
    void getActivitiesByUser_Success() {
        List<Activity> activities = Arrays.asList(testActivity);
        Page<Activity> page = new PageImpl<>(activities);
        Pageable pageable = PageRequest.of(0, 10);

        when(activityRepository.findByUserIdOrderByTimestampDesc(1L, pageable)).thenReturn(page);

        Page<ActivityResponse> result = activityService.getActivitiesByUser(1L, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1L, result.getContent().get(0).getUserId());
        verify(activityRepository).findByUserIdOrderByTimestampDesc(1L, pageable);
    }

    @Test
    void getActivitiesByDateRange_Success() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();
        List<Activity> activities = Arrays.asList(testActivity);
        Page<Activity> page = new PageImpl<>(activities);
        Pageable pageable = PageRequest.of(0, 10);

        when(activityRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate, pageable))
            .thenReturn(page);

        Page<ActivityResponse> result = activityService.getActivitiesByDateRange(startDate, endDate, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(activityRepository).findByTimestampBetweenOrderByTimestampDesc(startDate, endDate, pageable);
    }

    @Test
    void getActivitiesByAction_Success() {
        List<Activity> activities = Arrays.asList(testActivity);
        Page<Activity> page = new PageImpl<>(activities);
        Pageable pageable = PageRequest.of(0, 10);

        when(activityRepository.findByActionOrderByTimestampDesc("LOGIN", pageable)).thenReturn(page);

        Page<ActivityResponse> result = activityService.getActivitiesByAction("LOGIN", pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("LOGIN", result.getContent().get(0).getAction());
        verify(activityRepository).findByActionOrderByTimestampDesc("LOGIN", pageable);
    }

    @Test
    void toActivityResponse_Success() {
        ActivityResponse response = activityService.toActivityResponse(testActivity);

        assertNotNull(response);
        assertEquals(testActivity.getId(), response.getId());
        assertEquals(testActivity.getUserId(), response.getUserId());
        assertEquals(testActivity.getAction(), response.getAction());
        assertEquals(testActivity.getResource(), response.getResource());
        assertEquals(testActivity.getTimestamp(), response.getTimestamp());
        assertEquals(testActivity.getDetails(), response.getDetails());
    }
}