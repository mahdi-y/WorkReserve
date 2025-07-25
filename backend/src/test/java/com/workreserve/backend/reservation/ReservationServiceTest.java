package com.workreserve.backend.reservation;

import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.reservation.DTO.ReservationRequest;
import com.workreserve.backend.reservation.DTO.ReservationResponse;
import com.workreserve.backend.room.Room;
import com.workreserve.backend.timeslot.TimeSlot;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.workreserve.backend.exception.ResourceNotFoundException;
import com.workreserve.backend.exception.ValidationException;
import com.workreserve.backend.exception.ConflictException;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ActivityService activityService;

    @InjectMocks
    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext();
        // Set the activityService field using reflection since it's @Autowired
        ReflectionTestUtils.setField(reservationService, "activityService", activityService);
        ReflectionTestUtils.setField(reservationService, "reservationRepository", reservationRepository);
        ReflectionTestUtils.setField(reservationService, "timeSlotRepository", timeSlotRepository);
        ReflectionTestUtils.setField(reservationService, "userRepository", userRepository);
    }

    @Test
    void getReservationById_found() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        User user = new User();
        user.setId(2L);
        reservation.setUser(user);
        TimeSlot slot = new TimeSlot();
        slot.setId(3L);
        Room room = new Room();
        room.setId(4L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        reservation.setSlot(slot);
        reservation.setTeamSize(2);
        reservation.setTotalCost(10.0);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setCreatedAt(LocalDateTime.now());

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        ReservationResponse res = reservationService.getReservationById(1L);
        assertEquals(1L, res.getId());
        assertEquals(2, res.getTeamSize());
    }

    @Test
    void getReservationById_notFound() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> reservationService.getReservationById(1L));
        assertEquals("Reservation not found", ex.getMessage());
    }

    @Test
    void createReservation_success() {
        
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user.getEmail(), null)
        );

        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));

        ReservationRequest req = new ReservationRequest();
        req.setSlotId(2L);
        req.setTeamSize(3);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(timeSlotRepository.findById(2L)).thenReturn(Optional.of(slot));
        when(reservationRepository.existsBySlotIdAndStatusNot(2L, ReservationStatus.CANCELLED)).thenReturn(false);
        when(reservationRepository.findByUserIdAndSlotId(1L, 2L)).thenReturn(Optional.empty());
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> {
            Reservation r = i.getArgument(0);
            r.setId(10L);
            return r;
        });

        ReservationResponse res = reservationService.createReservation(req);
        assertEquals(10L, res.getId());
        assertEquals(3, res.getTeamSize());
    }

    @Test
    void createReservation_userNotFound() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("notfound@example.com", null)
        );
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(1L);
        req.setTeamSize(1);

        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> reservationService.createReservation(req));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void createReservation_slotNotFound() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user.getEmail(), null)
        );
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(2L);
        req.setTeamSize(1);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(timeSlotRepository.findById(2L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> reservationService.createReservation(req));
        assertEquals("Time slot not found", ex.getMessage());
    }

    @Test
    void createReservation_slotAlreadyReserved() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user.getEmail(), null)
        );
        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(2L);
        req.setTeamSize(1);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(timeSlotRepository.findById(2L)).thenReturn(Optional.of(slot));
        when(reservationRepository.existsBySlotIdAndStatusNot(2L, ReservationStatus.CANCELLED)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> reservationService.createReservation(req));
        assertEquals("Time slot already reserved", ex.getMessage());
    }

    @Test
    void createReservation_duplicateReservation() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user.getEmail(), null)
        );
        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(2L);
        req.setTeamSize(1);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(timeSlotRepository.findById(2L)).thenReturn(Optional.of(slot));
        when(reservationRepository.existsBySlotIdAndStatusNot(2L, ReservationStatus.CANCELLED)).thenReturn(false);
        when(reservationRepository.findByUserIdAndSlotId(1L, 2L)).thenReturn(Optional.of(new Reservation()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> reservationService.createReservation(req));
        assertEquals("You already have a reservation for this slot", ex.getMessage());
    }

    @Test
    void createReservation_teamSizeExceedsCapacity() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user.getEmail(), null)
        );
        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(2);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(2L);
        req.setTeamSize(5);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(timeSlotRepository.findById(2L)).thenReturn(Optional.of(slot));
        when(reservationRepository.existsBySlotIdAndStatusNot(2L, ReservationStatus.CANCELLED)).thenReturn(false);
        when(reservationRepository.findByUserIdAndSlotId(1L, 2L)).thenReturn(Optional.empty());

        ValidationException ex = assertThrows(ValidationException.class, () -> reservationService.createReservation(req));
        assertEquals("Team size exceeds room capacity", ex.getMessage());
    }

    @Test
    void updateReservation_success() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.PENDING);

        User user = new User();
        user.setId(1L);
        reservation.setUser(user);

        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        reservation.setSlot(slot);

        ReservationRequest req = new ReservationRequest();
        req.setSlotId(2L);
        req.setTeamSize(3);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(timeSlotRepository.findById(2L)).thenReturn(Optional.of(slot));
        when(reservationRepository.existsBySlotIdAndStatusNot(2L, ReservationStatus.CANCELLED)).thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        ReservationResponse res = reservationService.updateReservation(1L, req);
        assertEquals(3, res.getTeamSize());
    }

    @Test
    void updateReservation_notFound() {
        ReservationRequest req = new ReservationRequest();
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> reservationService.updateReservation(1L, req));
        assertEquals("Reservation not found", ex.getMessage());
    }

    @Test
    void updateReservation_cancelledOrCompleted() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.CANCELLED);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        ReservationRequest req = new ReservationRequest();
        RuntimeException ex = assertThrows(RuntimeException.class, () -> reservationService.updateReservation(1L, req));
        assertEquals("Cannot update a cancelled or completed reservation", ex.getMessage());
    }

    @Test
    void updateReservation_slotNotFound() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.PENDING);

        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        reservation.setSlot(slot);

        ReservationRequest req = new ReservationRequest();
        req.setSlotId(99L);
        req.setTeamSize(2);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(timeSlotRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> reservationService.updateReservation(1L, req));
        assertEquals("Time slot not found", ex.getMessage());
    }

    @Test
    void cancelReservation_success() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        assertDoesNotThrow(() -> reservationService.cancelReservation(1L));
        assertEquals(ReservationStatus.CANCELLED, reservation.getStatus());
    }

    @Test
    void cancelReservation_notFound() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> reservationService.cancelReservation(1L));
        assertEquals("Reservation not found", ex.getMessage());
    }

    @Test
    void updateStatus_success() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.PENDING);

        User user = new User();
        user.setId(1L);
        reservation.setUser(user);

        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        reservation.setSlot(slot);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        ReservationResponse res = reservationService.updateStatus(1L, ReservationStatus.CONFIRMED);
        assertEquals(ReservationStatus.CONFIRMED, res.getStatus());
    }

    @Test
    void updateStatus_notFound() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> reservationService.updateStatus(1L, ReservationStatus.CONFIRMED));
        assertEquals("Reservation not found", ex.getMessage());
    }

    @Test
    void getAllReservations_returnsList() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        reservation.setSlot(slot);
        reservation.setUser(new User());
        reservation.setTeamSize(2);
        reservation.setTotalCost(10.0);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setCreatedAt(LocalDateTime.now());

        when(reservationRepository.findAll()).thenReturn(List.of(reservation));
        List<ReservationResponse> res = reservationService.getAllReservations();
        assertEquals(1, res.size());
    }

    @Test
    void getUserReservations_returnsList() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        TimeSlot slot = new TimeSlot();
        slot.setId(2L);
        Room room = new Room();
        room.setId(3L);
        room.setCapacity(5);
        room.setPricePerHour(10.0);
        slot.setRoom(room);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        reservation.setSlot(slot);
        reservation.setUser(new User());
        reservation.setTeamSize(2);
        reservation.setTotalCost(10.0);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setCreatedAt(LocalDateTime.now());

        when(reservationRepository.findByUserId(1L)).thenReturn(List.of(reservation));
        List<ReservationResponse> res = reservationService.getUserReservations(1L);
        assertEquals(1, res.size());
    }

    
}