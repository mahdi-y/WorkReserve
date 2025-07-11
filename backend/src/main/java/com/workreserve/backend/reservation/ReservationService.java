package com.workreserve.backend.reservation;

import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.exception.ConflictException;
import com.workreserve.backend.exception.ResourceNotFoundException;
import com.workreserve.backend.exception.ValidationException;
import com.workreserve.backend.reservation.DTO.ReservationRequest;
import com.workreserve.backend.reservation.DTO.ReservationResponse;
import com.workreserve.backend.timeslot.TimeSlot;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private TimeSlotRepository timeSlotRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ActivityService activityService;

    @Cacheable("reservations")
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "user-reservations", key = "#userId")
    public List<ReservationResponse> getUserReservations(Long userId) {
        List<Reservation> reservations = reservationRepository.findByUserId(userId);
        return reservations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "reservations", key = "#id")
    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        return toResponse(reservation);
    }

    @CacheEvict(value = {"reservations", "user-reservations", "available-timeslots"}, allEntries = true)
    public ReservationResponse createReservation(ReservationRequest request) {
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        
        TimeSlot timeSlot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

        
        if (reservationRepository.existsBySlotIdAndStatusNot(timeSlot.getId(), ReservationStatus.CANCELLED)) {
            throw new ConflictException("Time slot already reserved");
        }

        
        if (reservationRepository.findByUserIdAndSlotId(user.getId(), timeSlot.getId()).isPresent()) {
            throw new ConflictException("You already have a reservation for this slot");
        }

        
        if (request.getTeamSize() > timeSlot.getRoom().getCapacity()) {
            throw new ValidationException("Team size exceeds room capacity");
        }

        
        double totalCost = timeSlot.getRoom().getPricePerHour() *
                (timeSlot.getEndTime().toSecondOfDay() - timeSlot.getStartTime().toSecondOfDay()) / 3600.0;

        Reservation reservation = new Reservation();
        reservation.setSlot(timeSlot);
        reservation.setUser(user);
        reservation.setTeamSize(request.getTeamSize());
        reservation.setTotalCost(totalCost);
        reservation.setStatus(ReservationStatus.CONFIRMED);

        Reservation savedReservation = reservationRepository.save(reservation);

        activityService.logActivity(
            user.getId(),
            "Booked " + timeSlot.getRoom().getName(),
            "RESERVATION",
            savedReservation.getId(),
            timeSlot.getRoom().getName()
        );

        return toResponse(savedReservation);
    }

    @CacheEvict(value = {"reservations", "user-reservations", "available-timeslots"}, allEntries = true)
    public ReservationResponse updateReservation(Long id, ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        
        if (reservation.getStatus() == ReservationStatus.CANCELLED ||
            reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new ValidationException("Cannot update a cancelled or completed reservation");
        }

        
        if (!reservation.getSlot().getId().equals(request.getSlotId())) {
            TimeSlot slot = timeSlotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));
            if (reservationRepository.existsBySlotIdAndStatusNot(slot.getId(), ReservationStatus.CANCELLED)) {
                throw new ConflictException("Time slot already reserved");
            }
            reservation.setSlot(slot);
        }

        if (request.getTeamSize() > reservation.getSlot().getRoom().getCapacity()) {
            throw new RuntimeException("Team size exceeds room capacity");
        }
        reservation.setTeamSize(request.getTeamSize());

        
        double totalCost = reservation.getSlot().getRoom().getPricePerHour() *
                (reservation.getSlot().getEndTime().toSecondOfDay() - reservation.getSlot().getStartTime().toSecondOfDay()) / 3600.0;
        reservation.setTotalCost(totalCost);

        Reservation updated = reservationRepository.save(reservation);
        return toResponse(updated);
    }

    @CacheEvict(value = {"reservations", "user-reservations", "available-timeslots"}, allEntries = true)
    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    @CacheEvict(value = {"reservations", "user-reservations"}, allEntries = true)
    public ReservationResponse updateStatus(Long id, ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        reservation.setStatus(status);
        return toResponse(reservationRepository.save(reservation));
    }

    private ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setSlotId(reservation.getSlot().getId());
        response.setUserId(reservation.getUser().getId());
        response.setTeamSize(reservation.getTeamSize());
        response.setTotalCost(reservation.getTotalCost());
        response.setStatus(reservation.getStatus());
        response.setCreatedAt(reservation.getCreatedAt());
        return response;
    }
}