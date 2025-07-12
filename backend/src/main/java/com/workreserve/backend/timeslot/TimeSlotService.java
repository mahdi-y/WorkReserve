package com.workreserve.backend.timeslot;

import com.workreserve.backend.exception.ConflictException;
import com.workreserve.backend.exception.ResourceNotFoundException;
import com.workreserve.backend.exception.ValidationException;
import com.workreserve.backend.room.Room;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.room.RoomService;
import com.workreserve.backend.timeslot.DTO.TimeSlotGenerationRequest;
import com.workreserve.backend.timeslot.DTO.TimeSlotRequest;
import com.workreserve.backend.timeslot.DTO.TimeSlotResponse;
import com.workreserve.backend.reservation.Reservation;
import com.workreserve.backend.reservation.ReservationRepository;
import com.workreserve.backend.reservation.ReservationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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

    @Cacheable("timeslots")
    public List<TimeSlotResponse> getAllTimeSlots() {
        String currentUserEmail = getCurrentUserEmail();
        return timeSlotRepository.findAll().stream()
                .map(slot -> toResponse(slot, currentUserEmail))
                .collect(Collectors.toList());
    }

    @Cacheable(value = "timeslots", key = "#id")
    public TimeSlotResponse getTimeSlotById(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));
        return toResponse(timeSlot);
    }

    @Cacheable(value = "available-timeslots", key = "#startDate + '-' + #endDate")
    public List<TimeSlotResponse> getAvailableTimeSlots(LocalDate startDate, LocalDate endDate) {
        List<TimeSlot> availableSlots = timeSlotRepository.findAvailableTimeSlots(startDate, endDate);
        return availableSlots.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "room-timeslots", key = "#roomId")
    public List<TimeSlotResponse> getTimeSlotsByRoom(Long roomId) {
        List<TimeSlot> timeSlots = timeSlotRepository.findByRoomId(roomId);
        return timeSlots.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "daterange-timeslots", key = "#startDate + '-' + #endDate")
    public List<TimeSlotResponse> getTimeSlotsByDateRange(LocalDate startDate, LocalDate endDate) {
        String currentUserEmail = getCurrentUserEmail();
        List<TimeSlot> timeSlots = timeSlotRepository.findByDateBetween(startDate, endDate);
        return timeSlots.stream()
                .map(slot -> toResponse(slot, currentUserEmail))
                .collect(Collectors.toList());
    }

    
    @CacheEvict(value = {"timeslots", "available-timeslots", "room-timeslots", "daterange-timeslots"}, allEntries = true)
    public TimeSlotResponse createTimeSlot(TimeSlotRequest request) {
        
        if (request.getStartTime().isAfter(request.getEndTime()) || 
            request.getStartTime().equals(request.getEndTime())) {
            throw new ValidationException("Start time must be before end time");
        }

        
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        
        List<TimeSlot> conflicts = timeSlotRepository.findConflictingTimeSlots(
                request.getRoomId(), 
                request.getDate(), 
                request.getStartTime(), 
                request.getEndTime()
        );
        
        if (!conflicts.isEmpty()) {
            throw new ConflictException("Time slot conflicts with existing slot");
        }

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDate(request.getDate());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        timeSlot.setRoom(room);

        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return toResponse(saved);
    }

    @CacheEvict(value = {"timeslots", "available-timeslots", "room-timeslots", "daterange-timeslots"}, allEntries = true)
    public TimeSlotResponse updateTimeSlot(Long id, TimeSlotRequest request) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

        
        if (request.getStartTime().isAfter(request.getEndTime()) || 
            request.getStartTime().equals(request.getEndTime())) {
            throw new ValidationException("Start time must be before end time");
        }

        
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        
        List<TimeSlot> conflicts = timeSlotRepository.findConflictingTimeSlots(
                request.getRoomId(), 
                request.getDate(), 
                request.getStartTime(), 
                request.getEndTime()
        ).stream()
        .filter(slot -> !slot.getId().equals(id))
        .collect(Collectors.toList());
        
        if (!conflicts.isEmpty()) {
            throw new ConflictException("Time slot conflicts with existing slot");
        }

        timeSlot.setDate(request.getDate());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        timeSlot.setRoom(room);

        return toResponse(timeSlotRepository.save(timeSlot));
    }

    @CacheEvict(value = {"timeslots", "available-timeslots", "room-timeslots", "daterange-timeslots"}, allEntries = true)
    public void deleteTimeSlot(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));
        
        
        boolean hasActiveReservations = reservationRepository.existsBySlotIdAndStatusNot(
                id, com.workreserve.backend.reservation.ReservationStatus.CANCELLED);
        
        if (hasActiveReservations) {
            throw new ValidationException("Cannot delete time slot with active reservations");
        }
        
        timeSlotRepository.deleteById(id);
    }

    @CacheEvict(value = {"timeslots", "available-timeslots", "room-timeslots", "daterange-timeslots"}, allEntries = true)
    public List<TimeSlotResponse> createTimeSlotsBulk(List<TimeSlotRequest> requests) {
        return requests.stream()
            .map(this::createTimeSlot)
            .collect(Collectors.toList());
    }

    private TimeSlotResponse toResponse(TimeSlot timeSlot) {
        return toResponse(timeSlot, null);
    }

    private TimeSlotResponse toResponse(TimeSlot timeSlot, String currentUserEmail) {
        TimeSlotResponse response = new TimeSlotResponse();
        response.setId(timeSlot.getId());
        response.setDate(timeSlot.getDate());
        response.setStartTime(timeSlot.getStartTime());
        response.setEndTime(timeSlot.getEndTime());
        response.setRoom(roomService.getRoomById(timeSlot.getRoom().getId()));
        
        Optional<Reservation> activeReservation = reservationRepository
            .findBySlotIdAndStatusNot(timeSlot.getId(), ReservationStatus.CANCELLED)
            .stream()
            .findFirst();
        
        if (activeReservation.isPresent()) {
            response.setAvailable(false);
            Reservation reservation = activeReservation.get();
            response.setBookedByUserName(reservation.getUser().getFullName());
            
            if (currentUserEmail != null) {
                response.setBookedByCurrentUser(
                    reservation.getUser().getEmail().equals(currentUserEmail)
                );
            }
        } else {
            response.setAvailable(true);
            response.setBookedByCurrentUser(false);
        }
        
        return response;
    }

        @CacheEvict(value = {"timeslots", "available-timeslots", "room-timeslots", "daterange-timeslots"}, allEntries = true)
    public List<TimeSlotResponse> generateBulkTimeSlots(TimeSlotGenerationRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        
        List<TimeSlot> createdSlots = new ArrayList<>();
        LocalDate currentDate = request.getStartDate();
        
        while (!currentDate.isAfter(request.getEndDate())) {
            boolean shouldCreateSlots = true;
            
            if (request.isSkipWeekends() && (currentDate.getDayOfWeek().getValue() == 6 || currentDate.getDayOfWeek().getValue() == 7)) {
                shouldCreateSlots = false;
            }
            
            if (request.isRepeatWeekly() && request.getWeekDays() != null && !request.getWeekDays().isEmpty()) {
                int dayOfWeek = currentDate.getDayOfWeek().getValue(); 
                if (!request.getWeekDays().contains(dayOfWeek)) {
                    shouldCreateSlots = false;
                }
            }
            
            if (shouldCreateSlots) {
                for (TimeSlotGenerationRequest.TimeSlotTemplate template : request.getTimeSlots()) {
                    LocalTime startTime = LocalTime.parse(template.getStartTime());
                    LocalTime endTime = LocalTime.parse(template.getEndTime());
                    
                    List<TimeSlot> conflicts = timeSlotRepository.findConflictingTimeSlots(
                            request.getRoomId(), currentDate, startTime, endTime);
                    
                    if (conflicts.isEmpty()) {
                        TimeSlot timeSlot = new TimeSlot();
                        timeSlot.setDate(currentDate);
                        timeSlot.setStartTime(startTime);
                        timeSlot.setEndTime(endTime);
                        timeSlot.setRoom(room);
                        
                        createdSlots.add(timeSlotRepository.save(timeSlot));
                    }
                }
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        return createdSlots.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }
}