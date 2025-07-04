package com.workreserve.backend.room;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.workreserve.backend.room.DTO.RoomRequest;
import com.workreserve.backend.room.DTO.RoomResponse;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Room management endpoints")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Operation(summary = "Get all rooms", description = "Retrieve a list of all available rooms")
    @ApiResponse(responseCode = "200", description = "List of rooms retrieved successfully")
    @GetMapping
    public List<RoomResponse> getAllRooms() {
        return roomService.getAllRooms();
    }

    @Operation(summary = "Get room by ID", description = "Retrieve a specific room by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Room found"),
        @ApiResponse(responseCode = "404", description = "Room not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @Operation(summary = "Create new room", description = "Create a new room (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Room created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error or room name already exists"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin required")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @Operation(summary = "Update room", description = "Update an existing room by ID (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Room updated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin required"),
        @ApiResponse(responseCode = "404", description = "Room not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @Operation(summary = "Delete room", description = "Delete a room by its ID (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponse(responseCode = "204", description = "Room deleted successfully")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get available rooms", description = "Get rooms available for a specific date and time")
    @GetMapping("/available")
    public List<RoomResponse> getAvailableRooms(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.TIME) java.time.LocalTime startTime,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.TIME) java.time.LocalTime endTime
    ) {
        return roomService.getAvailableRooms(date, startTime, endTime);
    }
}