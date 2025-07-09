package com.workreserve.backend.timeslot;

import com.workreserve.backend.timeslot.DTO.BulkTimeSlotRequest;
import com.workreserve.backend.timeslot.DTO.TimeSlotGenerationRequest;
import com.workreserve.backend.timeslot.DTO.TimeSlotRequest;
import com.workreserve.backend.timeslot.DTO.TimeSlotResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timeslots")
@Tag(name = "Time Slots", description = "Time slot management endpoints")
public class TimeSlotController {

    @Autowired
    private TimeSlotService timeSlotService;

    @Operation(summary = "Get all time slots", description = "Retrieve a list of all time slots")
    @ApiResponse(responseCode = "200", description = "List of time slots retrieved successfully",
            content = @Content(schema = @Schema(implementation = TimeSlotResponse.class)))
    @GetMapping
    public List<TimeSlotResponse> getAllTimeSlots() {
        return timeSlotService.getAllTimeSlots();
    }

    @Operation(summary = "Get time slot by ID", description = "Retrieve a specific time slot by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Time slot found",
                content = @Content(schema = @Schema(implementation = TimeSlotResponse.class))),
        @ApiResponse(responseCode = "404", description = "Time slot not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TimeSlotResponse> getTimeSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotById(id));
    }

    @Operation(summary = "Get available time slots", description = "Get all available time slots within a date range")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available time slots retrieved successfully",
                content = @Content(schema = @Schema(implementation = TimeSlotResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid date range")
    })
    @GetMapping("/available")
    public List<TimeSlotResponse> getAvailableTimeSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return timeSlotService.getAvailableTimeSlots(startDate, endDate);
    }

    @Operation(summary = "Get time slots by room", description = "Get all time slots for a specific room")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Time slots for room retrieved successfully",
                content = @Content(schema = @Schema(implementation = TimeSlotResponse.class))),
        @ApiResponse(responseCode = "404", description = "Room not found")
    })
    @GetMapping("/room/{roomId}")
    public List<TimeSlotResponse> getTimeSlotsByRoom(@PathVariable Long roomId) {
        return timeSlotService.getTimeSlotsByRoom(roomId);
    }

    @Operation(summary = "Get time slots by date range", description = "Get all time slots within a specific date range")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Time slots in date range retrieved successfully",
                content = @Content(schema = @Schema(implementation = TimeSlotResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid date range")
    })
    @GetMapping("/date-range")
    public List<TimeSlotResponse> getTimeSlotsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return timeSlotService.getTimeSlotsByDateRange(startDate, endDate);
    }

    @Operation(summary = "Create time slot", description = "Create a new time slot (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Time slot created successfully",
                content = @Content(schema = @Schema(implementation = TimeSlotResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error or time slot conflict"),
        @ApiResponse(responseCode = "404", description = "Room not found"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin required")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<TimeSlotResponse> createTimeSlot(@Valid @RequestBody TimeSlotRequest request) {
        return ResponseEntity.ok(timeSlotService.createTimeSlot(request));
    }

    @Operation(summary = "Create multiple time slots", description = "Create multiple time slots in bulk (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Time slots created successfully",
                content = @Content(schema = @Schema(implementation = TimeSlotResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error or time slot conflicts"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin required")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/bulk")
    public List<TimeSlotResponse> createTimeSlotsBulk(@Valid @RequestBody BulkTimeSlotRequest request) {
        return timeSlotService.createTimeSlotsBulk(request.getTimeSlots());
    }

    @Operation(summary = "Generate bulk time slots", description = "Generate multiple time slots with advanced scheduling options (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/bulk-generate")
    public List<TimeSlotResponse> generateBulkTimeSlots(@Valid @RequestBody TimeSlotGenerationRequest request) {
        return timeSlotService.generateBulkTimeSlots(request);
    }

    @Operation(summary = "Update time slot", description = "Update an existing time slot (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Time slot updated successfully",
                content = @Content(schema = @Schema(implementation = TimeSlotResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error or time slot conflict"),
        @ApiResponse(responseCode = "404", description = "Time slot not found"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin required")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<TimeSlotResponse> updateTimeSlot(@PathVariable Long id, @Valid @RequestBody TimeSlotRequest request) {
        return ResponseEntity.ok(timeSlotService.updateTimeSlot(id, request));
    }

    @Operation(summary = "Delete time slot", description = "Delete a time slot by its ID (Admin only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Time slot deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Time slot not found"),
        @ApiResponse(responseCode = "400", description = "Cannot delete time slot with active reservations"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin required")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeSlot(@PathVariable Long id) {
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.noContent().build();
    }
}