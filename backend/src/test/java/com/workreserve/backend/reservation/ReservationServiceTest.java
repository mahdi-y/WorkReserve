package com.workreserve.backend.reservation;

import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.exception.ConflictException;
import com.workreserve.backend.exception.ResourceNotFoundException;
import com.workreserve.backend.exception.ValidationException;
import com.workreserve.backend.reservation.DTO.ReservationRequest;
import com.workreserve.backend.reservation.DTO.ReservationResponse;
import com.workreserve.backend.room.Room;
import com.workreserve.backend.room.RoomType;
import com.workreserve.backend.timeslot.TimeSlot;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.Role;
import com.workreserve.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)  
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityService activityService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ReservationService reservationService;

    private User testUser;
    private Room testRoom;
    private TimeSlot testTimeSlot;
    private Reservation testReservation;
    private ReservationRequest testRequest;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setRole(Role.USER);

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setName("Test Room");
        testRoom.setType(RoomType.CONFERENCE_ROOM);
        testRoom.setCapacity(10);
        testRoom.setPricePerHour(25.0);

        testTimeSlot = new TimeSlot();
        testTimeSlot.setId(1L);
        testTimeSlot.setDate(LocalDate.now().plusDays(1));
        testTimeSlot.setStartTime(LocalTime.of(9, 0));
        testTimeSlot.setEndTime(LocalTime.of(10, 0));
        testTimeSlot.setRoom(testRoom);

        testReservation = new Reservation();
        testReservation.setId(1L);
        testReservation.setUser(testUser);
        testReservation.setSlot(testTimeSlot);
        testReservation.setTeamSize(5);
        testReservation.setTotalCost(25.0);
        testReservation.setStatus(ReservationStatus.CONFIRMED);

        testRequest = new ReservationRequest();
        testRequest.setSlotId(1L);
        testRequest.setTeamSize(5);
    }

    @Test
    void getAllReservations_success() {
        when(reservationRepository.findAll()).thenReturn(Arrays.asList(testReservation));

        List<ReservationResponse> result = reservationService.getAllReservations();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testReservation.getId(), result.get(0).getId());
        assertEquals(testReservation.getTeamSize(), result.get(0).getTeamSize());
    }

    @Test
    void getUserReservations_success() {
        when(reservationRepository.findByUserId(1L)).thenReturn(Arrays.asList(testReservation));

        List<ReservationResponse> result = reservationService.getUserReservations(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testReservation.getId(), result.get(0).getId());
    }

    @Test
    void getReservationById_success() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        ReservationResponse result = reservationService.getReservationById(1L);

        assertNotNull(result);
        assertEquals(testReservation.getId(), result.getId());
        assertEquals(testReservation.getTeamSize(), result.getTeamSize());
    }

    @Test
    void getReservationById_notFound() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.getReservationById(99L);
        });
    }

    @Test
    void createReservation_success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(testTimeSlot));
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, ReservationStatus.CANCELLED)).thenReturn(false);
        when(reservationRepository.findByUserIdAndSlotId(1L, 1L)).thenReturn(Optional.empty());
        when(reservationRepository.save(any(Reservation.class))).thenReturn(testReservation);
        doNothing().when(activityService).logActivity(anyLong(), anyString(), anyString(), anyLong(), anyString());

        ReservationResponse result = reservationService.createReservation(testRequest);

        assertNotNull(result);
        assertEquals(testReservation.getId(), result.getId());
        assertEquals(testReservation.getTeamSize(), result.getTeamSize());
        verify(reservationRepository).save(any(Reservation.class));
        verify(activityService).logActivity(eq(1L), contains("Booked"), eq("RESERVATION"), eq(1L), eq("Test Room"));
    }

    @Test
    void createReservation_userNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.createReservation(testRequest);
        });
    }

    @Test
    void createReservation_timeSlotNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.createReservation(testRequest);
        });
    }

    @Test
    void createReservation_slotAlreadyReserved() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(testTimeSlot));
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, ReservationStatus.CANCELLED)).thenReturn(true);

        assertThrows(ConflictException.class, () -> {
            reservationService.createReservation(testRequest);
        });
    }

    @Test
    void createReservation_userAlreadyHasReservation() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(testTimeSlot));
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, ReservationStatus.CANCELLED)).thenReturn(false);
        when(reservationRepository.findByUserIdAndSlotId(1L, 1L)).thenReturn(Optional.of(testReservation));

        assertThrows(ConflictException.class, () -> {
            reservationService.createReservation(testRequest);
        });
    }

    @Test
    void createReservation_teamSizeExceedsCapacity() {
        testRequest.setTeamSize(15); 
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(testTimeSlot));
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, ReservationStatus.CANCELLED)).thenReturn(false);
        when(reservationRepository.findByUserIdAndSlotId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ValidationException.class, () -> {
            reservationService.createReservation(testRequest);
        });
    }

    @Test
    void updateReservation_success() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(testReservation);

        ReservationResponse result = reservationService.updateReservation(1L, testRequest);

        assertNotNull(result);
        assertEquals(testReservation.getId(), result.getId());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void updateReservation_notFound() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.updateReservation(99L, testRequest);
        });
    }

    @Test
    void updateReservation_alreadyCancelled() {
        testReservation.setStatus(ReservationStatus.CANCELLED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        assertThrows(ValidationException.class, () -> {
            reservationService.updateReservation(1L, testRequest);
        });
    }

    @Test
    void cancelReservation_success() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(testReservation);

        assertDoesNotThrow(() -> reservationService.cancelReservation(1L));

        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void cancelReservation_notFound() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.cancelReservation(99L);
        });
    }

    @Test
    void updateStatus_success() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(testReservation);

        ReservationResponse result = reservationService.updateStatus(1L, ReservationStatus.COMPLETED);

        assertNotNull(result);
        assertEquals(testReservation.getId(), result.getId());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void updateStatus_notFound() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.updateStatus(99L, ReservationStatus.COMPLETED);
        });
    }

    @Test
    void getReservationBySlotId_success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(reservationRepository.findByUserIdAndSlotId(1L, 1L)).thenReturn(Optional.of(testReservation));

        ReservationResponse result = reservationService.getReservationBySlotId(1L);

        assertNotNull(result);
        assertEquals(testReservation.getId(), result.getId());
    }

    @Test
    void getReservationBySlotId_userNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.getReservationBySlotId(1L);
        });
    }

    @Test
    void getReservationBySlotId_reservationNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(reservationRepository.findByUserIdAndSlotId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reservationService.getReservationBySlotId(1L);
        });
    }
}