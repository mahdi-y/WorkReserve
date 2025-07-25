package com.workreserve.backend.activity;

import com.workreserve.backend.activity.DTO.ActivityResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityControllerTest {

    @Mock
    private ActivityService activityService;

    @InjectMocks
    private ActivityController activityController;

    private ActivityResponse testActivityResponse;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        testActivityResponse = new ActivityResponse();
        testActivityResponse.setId(1L);
        testActivityResponse.setUserId(1L);
        testActivityResponse.setAction("LOGIN");
        testActivityResponse.setResource("USER");
        testActivityResponse.setTimestamp(LocalDateTime.now());
        testActivityResponse.setDetails("User logged in successfully");

        pageable = PageRequest.of(0, 10);
    }

    @Test
    void getAllActivities_Success() {
        List<ActivityResponse> activities = Arrays.asList(testActivityResponse);
        Page<ActivityResponse> page = new PageImpl<>(activities);

        when(activityService.getAllActivities(pageable)).thenReturn(page);

        ResponseEntity<Page<ActivityResponse>> response = activityController.getAllActivities(pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getContent().size());
        assertEquals("LOGIN", response.getBody().getContent().get(0).getAction());
        verify(activityService).getAllActivities(pageable);
    }

    @Test
    void getActivitiesByUser_Success() {
        List<ActivityResponse> activities = Arrays.asList(testActivityResponse);
        Page<ActivityResponse> page = new PageImpl<>(activities);

        when(activityService.getActivitiesByUser(1L, pageable)).thenReturn(page);

        ResponseEntity<Page<ActivityResponse>> response = activityController.getActivitiesByUser(1L, pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getContent().size());
        assertEquals(1L, response.getBody().getContent().get(0).getUserId());
        verify(activityService).getActivitiesByUser(1L, pageable);
    }

    @Test
    void getActivitiesByDateRange_Success() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();
        List<ActivityResponse> activities = Arrays.asList(testActivityResponse);
        Page<ActivityResponse> page = new PageImpl<>(activities);

        when(activityService.getActivitiesByDateRange(startDate, endDate, pageable)).thenReturn(page);

        ResponseEntity<Page<ActivityResponse>> response = 
            activityController.getActivitiesByDateRange(startDate, endDate, pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getContent().size());
        verify(activityService).getActivitiesByDateRange(startDate, endDate, pageable);
    }

    @Test
    void getActivitiesByAction_Success() {
        List<ActivityResponse> activities = Arrays.asList(testActivityResponse);
        Page<ActivityResponse> page = new PageImpl<>(activities);

        when(activityService.getActivitiesByAction("LOGIN", pageable)).thenReturn(page);

        ResponseEntity<Page<ActivityResponse>> response = 
            activityController.getActivitiesByAction("LOGIN", pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getContent().size());
        assertEquals("LOGIN", response.getBody().getContent().get(0).getAction());
        verify(activityService).getActivitiesByAction("LOGIN", pageable);
    }

    @Test
    void getAllActivities_EmptyResult() {
        Page<ActivityResponse> emptyPage = new PageImpl<>(Arrays.asList());

        when(activityService.getAllActivities(pageable)).thenReturn(emptyPage);

        ResponseEntity<Page<ActivityResponse>> response = activityController.getAllActivities(pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().getContent().size());
        verify(activityService).getAllActivities(pageable);
    }

    @Test
    void getActivitiesByUser_EmptyResult() {
        Page<ActivityResponse> emptyPage = new PageImpl<>(Arrays.asList());

        when(activityService.getActivitiesByUser(99L, pageable)).thenReturn(emptyPage);

        ResponseEntity<Page<ActivityResponse>> response = activityController.getActivitiesByUser(99L, pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().getContent().size());
        verify(activityService).getActivitiesByUser(99L, pageable);
    }
}