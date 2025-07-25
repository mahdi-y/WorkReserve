package com.workreserve.backend.admin;

import com.workreserve.backend.admin.DTO.*;
import com.workreserve.backend.reservation.ReservationRepository;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.activity.ActivityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private ReservationRepository reservationRepository;
    
    @Mock
    private RoomRepository roomRepository;
    
    @Mock
    private ActivityRepository activityRepository;

    @InjectMocks
    private AdminService adminService;

    @BeforeEach
    void setUp() {
        // Setup test data
    }

    @Test
    void getAdminStats_Success() {
        when(userRepository.count()).thenReturn(100L);
        when(reservationRepository.count()).thenReturn(500L);
        when(roomRepository.count()).thenReturn(10L);
        when(activityRepository.count()).thenReturn(1000L);

        AdminStatsResponse stats = adminService.getAdminStats();

        assertNotNull(stats);
        assertEquals(100L, stats.getTotalUsers());
        assertEquals(500L, stats.getTotalReservations());
        assertEquals(10L, stats.getTotalRooms());
        assertEquals(1000L, stats.getTotalActivities());
    }

    @Test
    void getUserGrowthStats_Success() {
        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();
        
        List<Object[]> mockData = Arrays.asList(
            new Object[]{"2024-01-01", 5L},
            new Object[]{"2024-01-02", 8L},
            new Object[]{"2024-01-03", 12L}
        );

        when(userRepository.findUserGrowthStats(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(mockData);

        List<UserGrowthStatsResponse> result = adminService.getUserGrowthStats(startDate, endDate);

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("2024-01-01", result.get(0).getDate());
        assertEquals(5L, result.get(0).getUserCount());
    }

    @Test
    void getRevenueStats_Success() {
        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();
        
        List<Object[]> mockData = Arrays.asList(
            new Object[]{"2024-01", 1000.0},
            new Object[]{"2024-02", 1500.0},
            new Object[]{"2024-03", 2000.0}
        );

        when(reservationRepository.findMonthlyRevenueStats(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(mockData);

        List<MonthlyStatsResponse> result = adminService.getRevenueStats(startDate, endDate);

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("2024-01", result.get(0).getMonth());
        assertEquals(1000.0, result.get(0).getValue());
    }

    @Test
    void getRoomUsageStats_Success() {
        List<Object[]> mockData = Arrays.asList(
            new Object[]{1L, "Conference Room A", 50L},
            new Object[]{2L, "Meeting Room B", 35L},
            new Object[]{3L, "Study Room C", 25L}
        );

        when(reservationRepository.findRoomUsageStats()).thenReturn(mockData);

        List<RoomUsageStatsResponse> result = adminService.getRoomUsageStats();

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(1L, result.get(0).getRoomId());
        assertEquals("Conference Room A", result.get(0).getRoomName());
        assertEquals(50L, result.get(0).getReservationCount());
    }

    @Test
    void getDailyActivityStats_Success() {
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        
        List<Object[]> mockData = Arrays.asList(
            new Object[]{"2024-01-01", 25L},
            new Object[]{"2024-01-02", 30L},
            new Object[]{"2024-01-03", 20L}
        );

        when(activityRepository.findDailyActivityStats(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(mockData);

        List<DailyActivityStatsResponse> result = adminService.getDailyActivityStats(startDate, endDate);

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("2024-01-01", result.get(0).getDate());
        assertEquals(25L, result.get(0).getActivityCount());
    }

    @Test
    void getWeeklyRevenueStats_Success() {
        LocalDate startDate = LocalDate.now().minusWeeks(4);
        LocalDate endDate = LocalDate.now();
        
        List<Object[]> mockData = Arrays.asList(
            new Object[]{"2024-W01", 500.0},
            new Object[]{"2024-W02", 750.0},
            new Object[]{"2024-W03", 600.0}
        );

        when(reservationRepository.findWeeklyRevenueStats(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(mockData);

        List<WeeklyRevenueStatsResponse> result = adminService.getWeeklyRevenueStats(startDate, endDate);

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("2024-W01", result.get(0).getWeek());
        assertEquals(500.0, result.get(0).getRevenue());
    }

    @Test
    void getSystemActivity_Success() {
        List<Object[]> mockData = Arrays.asList(
            new Object[]{"LOGIN", 100L},
            new Object[]{"RESERVATION_CREATED", 50L},
            new Object[]{"PROFILE_UPDATED", 25L}
        );

        when(activityRepository.findSystemActivityStats()).thenReturn(mockData);

        List<SystemActivityResponse> result = adminService.getSystemActivity();

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("LOGIN", result.get(0).getAction());
        assertEquals(100L, result.get(0).getCount());
    }

    @Test
    void getAdminStats_WithZeroValues() {
        when(userRepository.count()).thenReturn(0L);
        when(reservationRepository.count()).thenReturn(0L);
        when(roomRepository.count()).thenReturn(0L);
        when(activityRepository.count()).thenReturn(0L);

        AdminStatsResponse stats = adminService.getAdminStats();

        assertNotNull(stats);
        assertEquals(0L, stats.getTotalUsers());
        assertEquals(0L, stats.getTotalReservations());
        assertEquals(0L, stats.getTotalRooms());
        assertEquals(0L, stats.getTotalActivities());
    }
}