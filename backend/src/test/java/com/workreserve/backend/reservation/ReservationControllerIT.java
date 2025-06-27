package com.workreserve.backend.reservation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workreserve.backend.reservation.DTO.ReservationRequest;
import com.workreserve.backend.room.Room;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.room.RoomType;
import com.workreserve.backend.timeslot.TimeSlot;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.user.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReservationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    private Long userId;
    private Long slotId;

    @BeforeEach
    void setup() {
        reservationRepository.deleteAll();
        timeSlotRepository.deleteAll();
        roomRepository.deleteAll();
        userRepository.deleteAll();

        
        User user = new User();
        user.setFullName("Res User");
        user.setEmail("resuser@example.com");
        user.setPassword("$2a$10$dummyhash");
        user.setRole(Role.USER);
        user.setEnabled(true);
        userRepository.save(user);
        userId = user.getId();

        
        Room room = new Room();
        room.setName("Res Room");
        room.setType(RoomType.HOT_DESK);
        room.setPricePerHour(10.0);
        room.setCapacity(5);
        roomRepository.save(room);

        
        TimeSlot slot = new TimeSlot();
        slot.setDate(LocalDate.now().plusDays(1));
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        slot.setRoom(room);
        timeSlotRepository.save(slot);
        slotId = slot.getId();
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void createReservation_shouldReturnOk() throws Exception {
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(slotId);
        req.setTeamSize(2);

        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamSize").value(2));
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void createReservation_shouldReturnBadRequest_whenSlotNotFound() throws Exception {
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(99999L);
        req.setTeamSize(2);

        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Time slot not found"));
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void createReservation_shouldReturnBadRequest_whenTeamSizeTooLarge() throws Exception {
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(slotId);
        req.setTeamSize(100);

        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Team size exceeds room capacity"));
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void getUserReservations_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/reservations/user"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void getReservationById_shouldReturnBadRequest_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/reservations/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Reservation not found"));
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void updateReservation_shouldReturnOk() throws Exception {
        
        Reservation reservation = new Reservation();
        reservation.setUser(userRepository.findById(userId).orElseThrow());
        reservation.setSlot(timeSlotRepository.findById(slotId).orElseThrow());
        reservation.setTeamSize(2);
        reservation.setTotalCost(10.0);
        reservation.setStatus(ReservationStatus.PENDING);
        reservationRepository.save(reservation);

        ReservationRequest req = new ReservationRequest();
        req.setSlotId(slotId);
        req.setTeamSize(3);

        mockMvc.perform(put("/api/reservations/" + reservation.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamSize").value(3));
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void updateReservation_shouldReturnBadRequest_whenNotFound() throws Exception {
        ReservationRequest req = new ReservationRequest();
        req.setSlotId(slotId);
        req.setTeamSize(2);

        mockMvc.perform(put("/api/reservations/99999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Reservation not found"));
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void cancelReservation_shouldReturnNoContent() throws Exception {
        
        Reservation reservation = new Reservation();
        reservation.setUser(userRepository.findById(userId).orElseThrow());
        reservation.setSlot(timeSlotRepository.findById(slotId).orElseThrow());
        reservation.setTeamSize(2);
        reservation.setTotalCost(10.0);
        reservation.setStatus(ReservationStatus.PENDING);
        reservationRepository.save(reservation);

        mockMvc.perform(delete("/api/reservations/" + reservation.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "resuser@example.com", roles = "USER")
    void cancelReservation_shouldReturnBadRequest_whenNotFound() throws Exception {
        mockMvc.perform(delete("/api/reservations/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Reservation not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllReservations_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/reservations"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_shouldReturnOk() throws Exception {
        
        Reservation reservation = new Reservation();
        reservation.setUser(userRepository.findById(userId).orElseThrow());
        reservation.setSlot(timeSlotRepository.findById(slotId).orElseThrow());
        reservation.setTeamSize(2);
        reservation.setTotalCost(10.0);
        reservation.setStatus(ReservationStatus.PENDING);
        reservationRepository.save(reservation);

        mockMvc.perform(put("/api/reservations/" + reservation.getId() + "/status")
                .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_shouldReturnBadRequest_whenNotFound() throws Exception {
        mockMvc.perform(put("/api/reservations/99999/status")
                .contentType(MediaType.APPLICATION_JSON)
                .param("status", "CONFIRMED"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Reservation not found"));
    }
}