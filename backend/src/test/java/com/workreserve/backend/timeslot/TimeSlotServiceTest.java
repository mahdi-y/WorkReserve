package com.workreserve.backend.timeslot;

import com.workreserve.backend.room.Room;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.room.RoomService;
import com.workreserve.backend.timeslot.DTO.TimeSlotRequest;
import com.workreserve.backend.timeslot.DTO.TimeSlotResponse;
import com.workreserve.backend.reservation.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.Collections;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.workreserve.backend.exception.ResourceNotFoundException;
import com.workreserve.backend.exception.ValidationException;
import com.workreserve.backend.exception.ConflictException;

class TimeSlotServiceTest {

    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private RoomService roomService;
    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private TimeSlotService timeSlotService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getTimeSlotById_found() {
        Room room = new Room();
        room.setId(10L);
        
        TimeSlot slot = new TimeSlot();
        slot.setId(1L);
        slot.setRoom(room);
        slot.setDate(LocalDate.now());
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        
        com.workreserve.backend.room.DTO.RoomResponse roomResponse = new com.workreserve.backend.room.DTO.RoomResponse();
        roomResponse.setId(10L);
        
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(roomService.getRoomById(10L)).thenReturn(roomResponse);
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);
        
        TimeSlotResponse res = timeSlotService.getTimeSlotById(1L);
        assertEquals(1L, res.getId());
    }

    @Test
    void getTimeSlotById_notFound() {
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.empty());
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> timeSlotService.getTimeSlotById(1L));
        assertEquals("Time slot not found", ex.getMessage());
    }

    @Test
    void getAllTimeSlots_returnsTimeSlotResponses() {
        Room room = new Room();
        room.setId(1L);
        
        TimeSlot slot = new TimeSlot();
        slot.setId(1L);
        slot.setRoom(room);
        slot.setDate(LocalDate.now());
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        
        com.workreserve.backend.room.DTO.RoomResponse roomResponse = new com.workreserve.backend.room.DTO.RoomResponse();
        roomResponse.setId(1L);
        
        when(timeSlotRepository.findAll()).thenReturn(List.of(slot));
        when(roomService.getRoomById(1L)).thenReturn(roomResponse);
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);
        
        List<TimeSlotResponse> result = timeSlotService.getAllTimeSlots();
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void createTimeSlot_success() {
        TimeSlotRequest request = new TimeSlotRequest();
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(10, 0));
        request.setRoomId(1L);

        Room room = new Room();
        room.setId(1L);

        TimeSlot saved = new TimeSlot();
        saved.setId(1L);
        saved.setDate(request.getDate());
        saved.setStartTime(request.getStartTime());
        saved.setEndTime(request.getEndTime());
        saved.setRoom(room);

        com.workreserve.backend.room.DTO.RoomResponse roomResponse = new com.workreserve.backend.room.DTO.RoomResponse();
        roomResponse.setId(1L);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(timeSlotRepository.findConflictingTimeSlots(1L, request.getDate(), request.getStartTime(), request.getEndTime()))
                .thenReturn(Collections.emptyList());
        when(timeSlotRepository.save(any(TimeSlot.class))).thenReturn(saved);
        when(roomService.getRoomById(1L)).thenReturn(roomResponse);
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);

        TimeSlotResponse result = timeSlotService.createTimeSlot(request);
        assertEquals(1L, result.getId());
    }

    @Test
    void createTimeSlot_invalidTime_startAfterEnd() {
        TimeSlotRequest request = new TimeSlotRequest();
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(9, 0)); 
        request.setRoomId(1L);

        ValidationException ex = assertThrows(ValidationException.class, () -> timeSlotService.createTimeSlot(request));
        assertEquals("Start time must be before end time", ex.getMessage());
    }

    @Test
    void createTimeSlot_invalidTime_startEqualsEnd() {
        TimeSlotRequest request = new TimeSlotRequest();
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(9, 0)); 
        request.setRoomId(1L);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> timeSlotService.createTimeSlot(request));
        assertEquals("Start time must be before end time", ex.getMessage());
    }

    @Test
    void createTimeSlot_roomNotFound() {
        TimeSlotRequest request = new TimeSlotRequest();
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(10, 0));
        request.setRoomId(99L);

        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> timeSlotService.createTimeSlot(request));
        assertEquals("Room not found", ex.getMessage());
    }

    @Test
    void createTimeSlot_conflictingSlot() {
        TimeSlotRequest request = new TimeSlotRequest();
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(10, 0));
        request.setRoomId(1L);

        Room room = new Room();
        room.setId(1L);

        TimeSlot conflictingSlot = new TimeSlot();
        conflictingSlot.setId(2L);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(timeSlotRepository.findConflictingTimeSlots(1L, request.getDate(), request.getStartTime(), request.getEndTime()))
                .thenReturn(List.of(conflictingSlot));

        ConflictException ex = assertThrows(ConflictException.class, () -> timeSlotService.createTimeSlot(request));
        assertEquals("Time slot conflicts with existing slot", ex.getMessage());
    }

    @Test
    void updateTimeSlot_success() {
        TimeSlotRequest request = new TimeSlotRequest();
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(10, 0));
        request.setRoomId(1L);

        Room room = new Room();
        room.setId(1L);

        TimeSlot existing = new TimeSlot();
        existing.setId(1L);
        existing.setRoom(room);

        com.workreserve.backend.room.DTO.RoomResponse roomResponse = new com.workreserve.backend.room.DTO.RoomResponse();
        roomResponse.setId(1L);

        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(timeSlotRepository.findConflictingTimeSlots(1L, request.getDate(), request.getStartTime(), request.getEndTime()))
                .thenReturn(Collections.emptyList());
        when(timeSlotRepository.save(existing)).thenReturn(existing);
        when(roomService.getRoomById(1L)).thenReturn(roomResponse);
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);

        TimeSlotResponse result = timeSlotService.updateTimeSlot(1L, request);
        assertEquals(1L, result.getId());
    }

    @Test
    void updateTimeSlot_notFound() {
        TimeSlotRequest request = new TimeSlotRequest();
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> timeSlotService.updateTimeSlot(1L, request));
        assertEquals("Time slot not found", ex.getMessage());
    }

    @Test
    void deleteTimeSlot_success() {
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(1L);

        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);
        doNothing().when(timeSlotRepository).deleteById(1L);

        assertDoesNotThrow(() -> timeSlotService.deleteTimeSlot(1L));
        verify(timeSlotRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteTimeSlot_notFound() {
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> timeSlotService.deleteTimeSlot(1L));
        assertEquals("Time slot not found", ex.getMessage());
    }

    @Test
    void deleteTimeSlot_hasActiveReservations() {
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(1L);

        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> timeSlotService.deleteTimeSlot(1L));
        assertEquals("Cannot delete time slot with active reservations", ex.getMessage());
    }

    @Test
    void getTimeSlotsByRoom_success() {
        Room room = new Room();
        room.setId(1L);
        
        TimeSlot slot = new TimeSlot();
        slot.setId(1L);
        slot.setRoom(room);
        
        com.workreserve.backend.room.DTO.RoomResponse roomResponse = new com.workreserve.backend.room.DTO.RoomResponse();
        roomResponse.setId(1L);

        when(timeSlotRepository.findByRoomId(1L)).thenReturn(List.of(slot));
        when(roomService.getRoomById(1L)).thenReturn(roomResponse);
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);

        List<TimeSlotResponse> result = timeSlotService.getTimeSlotsByRoom(1L);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void getAvailableTimeSlots_success() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(7);
        
        Room room = new Room();
        room.setId(1L);
        
        TimeSlot slot = new TimeSlot();
        slot.setId(1L);
        slot.setRoom(room);
        
        com.workreserve.backend.room.DTO.RoomResponse roomResponse = new com.workreserve.backend.room.DTO.RoomResponse();
        roomResponse.setId(1L);

        when(timeSlotRepository.findAvailableTimeSlots(startDate, endDate)).thenReturn(List.of(slot));
        when(roomService.getRoomById(1L)).thenReturn(roomResponse);
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);

        List<TimeSlotResponse> result = timeSlotService.getAvailableTimeSlots(startDate, endDate);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void getTimeSlotsByDateRange_success() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(7);
        
        Room room = new Room();
        room.setId(1L);
        
        TimeSlot slot = new TimeSlot();
        slot.setId(1L);
        slot.setRoom(room);
        
        com.workreserve.backend.room.DTO.RoomResponse roomResponse = new com.workreserve.backend.room.DTO.RoomResponse();
        roomResponse.setId(1L);

        when(timeSlotRepository.findByDateBetween(startDate, endDate)).thenReturn(List.of(slot));
        when(roomService.getRoomById(1L)).thenReturn(roomResponse);
        when(reservationRepository.existsBySlotIdAndStatusNot(1L, com.workreserve.backend.reservation.ReservationStatus.CANCELLED)).thenReturn(false);

        List<TimeSlotResponse> result = timeSlotService.getTimeSlotsByDateRange(startDate, endDate);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
}
