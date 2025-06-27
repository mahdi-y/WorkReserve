package com.workreserve.backend.room;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workreserve.backend.room.DTO.RoomRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RoomControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllRooms_shouldReturnOk() throws Exception {
        System.out.println("Running: getAllRooms_shouldReturnOk");
        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk());
        System.out.println("Completed: getAllRooms_shouldReturnOk");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createRoom_shouldReturnBadRequest_whenInvalid() throws Exception {
        System.out.println("Running: createRoom_shouldReturnBadRequest_whenInvalid");
        RoomRequest req = new RoomRequest();
        mockMvc.perform(post("/api/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
        System.out.println("Completed: createRoom_shouldReturnBadRequest_whenInvalid");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createRoom_shouldReturnCreated_whenValid() throws Exception {
        System.out.println("Running: createRoom_shouldReturnCreated_whenValid");
        RoomRequest req = new RoomRequest();
        req.setName("Test Room " + System.currentTimeMillis());
        req.setType(RoomType.CONFERENCE_ROOM);
        req.setPricePerHour(50.0);
        req.setCapacity(10);

        mockMvc.perform(post("/api/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(req.getName()))
                .andExpect(jsonPath("$.type").value("CONFERENCE_ROOM"));
        System.out.println("Completed: createRoom_shouldReturnCreated_whenValid");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getRoomById_shouldReturnRoom_whenExists() throws Exception {
        System.out.println("Running: getRoomById_shouldReturnRoom_whenExists");
        RoomRequest req = new RoomRequest();
        req.setName("Room for Get " + System.currentTimeMillis());
        req.setType(RoomType.HOT_DESK);
        req.setPricePerHour(20.0);
        req.setCapacity(5);

        String response = mockMvc.perform(post("/api/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/rooms/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(req.getName()));
        System.out.println("Completed: getRoomById_shouldReturnRoom_whenExists (id=" + id + ")");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getRoomById_shouldReturnNotFound_whenMissing() throws Exception {
        System.out.println("Running: getRoomById_shouldReturnNotFound_whenMissing");
        mockMvc.perform(get("/api/rooms/999999"))
                .andExpect(status().isNotFound());
        System.out.println("Completed: getRoomById_shouldReturnNotFound_whenMissing");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateRoom_shouldReturnUpdatedRoom() throws Exception {
        System.out.println("Running: updateRoom_shouldReturnUpdatedRoom");
        RoomRequest req = new RoomRequest();
        req.setName("Test Room " + System.currentTimeMillis());
        req.setType(RoomType.HOT_DESK);
        req.setPricePerHour(15.0);
        req.setCapacity(4);

        String response = mockMvc.perform(post("/api/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        RoomRequest updateReq = new RoomRequest();
        updateReq.setName("Updated Room " + System.currentTimeMillis());
        updateReq.setType(RoomType.DEDICATED_DESK);
        updateReq.setPricePerHour(25.0);
        updateReq.setCapacity(6);

        mockMvc.perform(put("/api/rooms/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(updateReq.getName()))
                .andExpect(jsonPath("$.type").value("DEDICATED_DESK"));
        System.out.println("Completed: updateRoom_shouldReturnUpdatedRoom (id=" + id + ")");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteRoom_shouldReturnNoContent() throws Exception {
        System.out.println("Running: deleteRoom_shouldReturnNoContent");
        RoomRequest req = new RoomRequest();
        req.setName("Test Room " + System.currentTimeMillis());
        req.setType(RoomType.HOT_DESK);
        req.setPricePerHour(10.0);
        req.setCapacity(2);

        String response = mockMvc.perform(post("/api/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(delete("/api/rooms/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/rooms/" + id))
                .andExpect(status().isNotFound());
        System.out.println("Completed: deleteRoom_shouldReturnNoContent (id=" + id + ")");
    }
}
