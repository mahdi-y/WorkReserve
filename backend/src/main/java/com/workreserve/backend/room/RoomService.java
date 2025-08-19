package com.workreserve.backend.room;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.workreserve.backend.room.DTO.RoomRequest;
import com.workreserve.backend.room.DTO.RoomResponse;
import java.time.LocalDate;
import java.time.LocalTime;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import com.workreserve.backend.activity.ActivityService;
import com.workreserve.backend.config.FileStorageService;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ActivityService activityService;


    @Cacheable("rooms")
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "rooms", key = "#id")
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        return toResponse(room);
    }

    @CacheEvict(value = "rooms", allEntries = true)
    public RoomResponse createRoom(RoomRequest request) {
        String normalizedName = request.getName().trim().toLowerCase();
        boolean exists = roomRepository.findAll().stream()
            .anyMatch(r -> r.getName().trim().toLowerCase().equals(normalizedName));
        if (exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A room with this name already exists.");
        }
        
        Room room = new Room();
        room.setName(request.getName().trim());
        room.setType(request.getType());
        room.setPricePerHour(request.getPricePerHour());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setImageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>());
        
        Room savedRoom = roomRepository.save(room);

        String currentUserEmail = getCurrentUserEmail();
        if (currentUserEmail != null) {
            activityService.logActivity(
                currentUserEmail, 
                "New room created: " + savedRoom.getName(),
                "ROOM",
                savedRoom.getId(),
                savedRoom.getName()
            );
        }
        
        return toResponse(savedRoom);
    }

    @CacheEvict(value = "rooms", allEntries = true)
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        String normalizedName = request.getName().trim().toLowerCase();
        boolean exists = roomRepository.findAll().stream()
            .anyMatch(r -> !r.getId().equals(id) && r.getName().trim().toLowerCase().equals(normalizedName));
        if (exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A room with this name already exists.");
        }

        List<String> oldImages = room.getImageUrls();
        List<String> newImages = request.getImageUrls();
        oldImages.stream()
            .filter(oldImage -> !newImages.contains(oldImage))
            .forEach(fileStorageService::deleteFile);

        room.setName(request.getName().trim());
        room.setType(request.getType());
        room.setPricePerHour(request.getPricePerHour());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setImageUrls(request.getImageUrls());
        
        Room updatedRoom = roomRepository.save(room);

        String currentUserEmail = getCurrentUserEmail();
        if (currentUserEmail != null) {
            activityService.logActivity(
                currentUserEmail, 
                "Room updated: " + updatedRoom.getName(),
                "ROOM",
                updatedRoom.getId(),
                updatedRoom.getName()
            );
        }
        
        return toResponse(updatedRoom);
    }

    @CacheEvict(value = "rooms", allEntries = true)
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        
        String currentUserEmail = getCurrentUserEmail();
        if (currentUserEmail != null) {
            activityService.logActivity(
                currentUserEmail, 
                "Room deleted: " + room.getName(),
                "ROOM",
                room.getId(),
                room.getName()
            );
        }
        
        room.getImageUrls().forEach(fileStorageService::deleteFile);
        
        roomRepository.deleteById(id);
    }

    public List<RoomResponse> getAvailableRooms(LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Room> rooms = timeSlotRepository.findAvailableRooms(date, startTime, endTime);
        return rooms.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }

    private RoomResponse toResponse(Room room) {
        RoomResponse res = new RoomResponse();
        res.setId(room.getId());
        res.setName(room.getName());
        res.setType(room.getType());
        res.setPricePerHour(room.getPricePerHour());
        res.setCapacity(room.getCapacity());
        res.setDescription(room.getDescription());
        res.setImageUrls(room.getImageUrls() != null ? new ArrayList<>(room.getImageUrls()) : new ArrayList<>());
        return res;
    }
}