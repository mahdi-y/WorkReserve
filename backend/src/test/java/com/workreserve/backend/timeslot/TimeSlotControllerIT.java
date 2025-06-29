package com.workreserve.backend.timeslot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workreserve.backend.reservation.ReservationRepository;
import com.workreserve.backend.room.Room;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.room.RoomType;
import com.workreserve.backend.timeslot.DTO.TimeSlotRequest;

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
class TimeSlotControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    private Long testRoomId;

    @BeforeEach
    void setupRoom() {
        reservationRepository.deleteAll();
        timeSlotRepository.deleteAll();
        roomRepository.deleteAll();
        
        // Always create a fresh room and capture its actual ID
        Room room = new Room();
        room.setName("Test Room");
        room.setType(RoomType.HOT_DESK);
        room.setPricePerHour(10.0);
        room.setCapacity(2);
        Room savedRoom = roomRepository.save(room);
        testRoomId = savedRoom.getId();  // Use the actual generated ID
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTimeSlot_shouldReturnOk_whenValid() throws Exception {
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(1));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(10, 0));
        req.setRoomId(testRoomId); 

        mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllTimeSlots_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/timeslots"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTimeSlotById_shouldReturnOk() throws Exception {
        
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(2));
        req.setStartTime(LocalTime.of(11, 0));
        req.setEndTime(LocalTime.of(12, 0));
        req.setRoomId(testRoomId);

        String response = mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/timeslots/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateTimeSlot_shouldReturnOk() throws Exception {
        
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(3));
        req.setStartTime(LocalTime.of(13, 0));
        req.setEndTime(LocalTime.of(14, 0));
        req.setRoomId(testRoomId);

        String response = mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        
        req.setStartTime(LocalTime.of(15, 0));
        req.setEndTime(LocalTime.of(16, 0));

        mockMvc.perform(put("/api/timeslots/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startTime").value("15:00:00"))
                .andExpect(jsonPath("$.endTime").value("16:00:00"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteTimeSlot_shouldReturnNoContent() throws Exception {
        
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(4));
        req.setStartTime(LocalTime.of(17, 0));
        req.setEndTime(LocalTime.of(18, 0));
        req.setRoomId(testRoomId);

        String response = mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(delete("/api/timeslots/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/timeslots/" + id))
                .andExpect(status().isBadRequest()); 
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTimeSlotsByRoom_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/timeslots/room/" + testRoomId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTimeSlotsByDateRange_shouldReturnOk() throws Exception {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(10);
        mockMvc.perform(get("/api/timeslots/date-range")
                .param("startDate", start.toString())
                .param("endDate", end.toString()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAvailableTimeSlots_shouldReturnOk() throws Exception {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(10);
        mockMvc.perform(get("/api/timeslots/available")
                .param("startDate", start.toString())
                .param("endDate", end.toString()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTimeSlot_shouldReturnBadRequest_whenRoomNotFound() throws Exception {
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(1));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(10, 0));
        req.setRoomId(999L); 

        mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Room not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTimeSlot_shouldReturnBadRequest_whenTimeInvalid() throws Exception {
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(1));
        req.setStartTime(LocalTime.of(11, 0));
        req.setEndTime(LocalTime.of(10, 0)); 
        req.setRoomId(testRoomId);

        mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Start time must be before end time"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTimeSlot_shouldReturnBadRequest_whenConflicting() throws Exception {
        
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(5));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(10, 0));
        req.setRoomId(testRoomId);

        mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        
        TimeSlotRequest conflict = new TimeSlotRequest();
        conflict.setDate(req.getDate());
        conflict.setStartTime(LocalTime.of(9, 30));
        conflict.setEndTime(LocalTime.of(10, 30));
        conflict.setRoomId(testRoomId);

        mockMvc.perform(post("/api/timeslots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(conflict)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Time slot conflicts with existing slot"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTimeSlotById_shouldReturnBadRequest_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/timeslots/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Time slot not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateTimeSlot_shouldReturnBadRequest_whenNotFound() throws Exception {
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDate(LocalDate.now().plusDays(1));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(10, 0));
        req.setRoomId(testRoomId);

        mockMvc.perform(put("/api/timeslots/99999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Time slot not found"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteTimeSlot_shouldReturnBadRequest_whenNotFound() throws Exception {
        mockMvc.perform(delete("/api/timeslots/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Time slot not found"));
    }
}
