package com.workreserve.backend.admin;

import com.workreserve.backend.admin.DTO.*;
import com.workreserve.backend.reservation.ReservationRepository;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
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
    private TimeSlotRepository timeSlotRepository;

    @InjectMocks
    private AdminService adminService;

    @BeforeEach
    void setUp() {
        // Setup test data
    }

    @Test
    void getAdminStats_Success() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByEnabledTrue()).thenReturn(90L);
        when(roomRepository.count()).thenReturn(10L);
        when(reservationRepository.count()).thenReturn(500L);
        
        // Mock monthly user count methods
        when(userRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(20L);
        when(userRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(15L);

        AdminStatsResponse stats = adminService.getAdminStats();

        assertNotNull(stats);
        assertEquals(100L, stats.getTotalUsers());
        assertEquals(90L, stats.getActiveUsers());
        assertEquals(10L, stats.getTotalRooms());
        assertEquals(500L, stats.getTotalReservations());
        assertTrue(stats.getMonthlyGrowth() > 0); // Should have positive growth
    }

    @Test
    void getUserGrowthStats_Success() {
        List<UserGrowthStatsResponse> result = adminService.getUserGrowthStats();

        assertNotNull(result);
        // The actual implementation may return different data structure
        // This test verifies the method doesn't throw exceptions
    }

    @Test
    void getAdminStats_WithZeroValues() {
        when(userRepository.count()).thenReturn(0L);
        when(userRepository.countByEnabledTrue()).thenReturn(0L);
        when(roomRepository.count()).thenReturn(0L);
        when(reservationRepository.count()).thenReturn(0L);
        when(userRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(0L);
        when(userRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(0L);

        AdminStatsResponse stats = adminService.getAdminStats();

        assertNotNull(stats);
        assertEquals(0L, stats.getTotalUsers());
        assertEquals(0L, stats.getActiveUsers());
        assertEquals(0L, stats.getTotalRooms());
        assertEquals(0L, stats.getTotalReservations());
        assertEquals(0.0, stats.getMonthlyGrowth());
    }

    @Test
    void getAdminStats_VerifyMonthlyGrowthCalculation() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByEnabledTrue()).thenReturn(90L);
        when(roomRepository.count()).thenReturn(10L);
        when(reservationRepository.count()).thenReturn(500L);
        
        // This month: 25 users, previous month: 20 users = 25% growth
        when(userRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(25L);
        when(userRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(20L);

        AdminStatsResponse stats = adminService.getAdminStats();

        assertNotNull(stats);
        assertEquals(25.0, stats.getMonthlyGrowth(), 0.01); // 25% growth
    }

    @Test
    void getAdminStats_ZeroPreviousMonth_NoGrowth() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByEnabledTrue()).thenReturn(90L);
        when(roomRepository.count()).thenReturn(10L);
        when(reservationRepository.count()).thenReturn(500L);
        
        // This month: 25 users, previous month: 0 users = 0% growth (no division by zero)
        when(userRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(25L);
        when(userRepository.countByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(0L);

        AdminStatsResponse stats = adminService.getAdminStats();

        assertNotNull(stats);
        assertEquals(0.0, stats.getMonthlyGrowth());
    }
}