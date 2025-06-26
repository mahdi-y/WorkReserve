package com.workreserve.backend.timeslot;

import com.workreserve.backend.room.Room;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.room.RoomService;
import com.workreserve.backend.timeslot.DTO.TimeSlotRequest;
import com.workreserve.backend.timeslot.DTO.TimeSlotResponse;
import com.workreserve.backend.reservation.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimeSlotService {

    @Autowired
    private TimeSlotRepository timeSlotRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private RoomService roomService;
    
    @Autowired
    private ReservationRepository reservationRepository;

    public List<TimeSlotResponse> getAllTimeSlots() {
        return timeSlotRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TimeSlotResponse getTimeSlotById(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time slot not found"));
        return toResponse(timeSlot);
    }

    public List<TimeSlotResponse> getAvailableTimeSlots(LocalDate startDate, LocalDate endDate) {
        List<TimeSlot> availableSlots = timeSlotRepository.findAvailableTimeSlots(startDate, endDate);
        return availableSlots.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TimeSlotResponse> getTimeSlotsByRoom(Long roomId) {
        List<TimeSlot> timeSlots = timeSlotRepository.findByRoomId(roomId);
        return timeSlots.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TimeSlotResponse> getTimeSlotsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<TimeSlot> timeSlots = timeSlotRepository.findByDateBetween(startDate, endDate);
        return timeSlots.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TimeSlotResponse createTimeSlot(TimeSlotRequest request) {
        
        if (request.getStartTime().isAfter(request.getEndTime()) || 
            request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        
        List<TimeSlot> conflicts = timeSlotRepository.findConflictingTimeSlots(
                request.getRoomId(), 
                request.getDate(), 
                request.getStartTime(), 
                request.getEndTime()
        );
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot conflicts with existing slot");
        }

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDate(request.getDate());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        timeSlot.setRoom(room);

        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return toResponse(saved);
    }

    public TimeSlotResponse updateTimeSlot(Long id, TimeSlotRequest request) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time slot not found"));

        
        if (request.getStartTime().isAfter(request.getEndTime()) || 
            request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        
        List<TimeSlot> conflicts = timeSlotRepository.findConflictingTimeSlots(
                request.getRoomId(), 
                request.getDate(), 
                request.getStartTime(), 
                request.getEndTime()
        ).stream()
        .filter(slot -> !slot.getId().equals(id))
        .collect(Collectors.toList());
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot conflicts with existing slot");
        }

        timeSlot.setDate(request.getDate());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        timeSlot.setRoom(room);

        return toResponse(timeSlotRepository.save(timeSlot));
    }

    public void deleteTimeSlot(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time slot not found"));
        
        
        boolean hasActiveReservations = reservationRepository.existsBySlotIdAndStatusNot(
                id, com.workreserve.backend.reservation.ReservationStatus.CANCELLED);
        
        if (hasActiveReservations) {
            throw new RuntimeException("Cannot delete time slot with active reservations");
        }
        
        timeSlotRepository.deleteById(id);
    }

    private TimeSlotResponse toResponse(TimeSlot timeSlot) {
        TimeSlotResponse response = new TimeSlotResponse();
        response.setId(timeSlot.getId());
        response.setDate(timeSlot.getDate());
        response.setStartTime(timeSlot.getStartTime());
        response.setEndTime(timeSlot.getEndTime());
        response.setRoom(roomService.getRoomById(timeSlot.getRoom().getId()));
        
        boolean isAvailable = !reservationRepository.existsBySlotIdAndStatusNot(
                timeSlot.getId(), com.workreserve.backend.reservation.ReservationStatus.CANCELLED);
        response.setAvailable(isAvailable);
        
        return response;
    }
}