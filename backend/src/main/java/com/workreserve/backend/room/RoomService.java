package com.workreserve.backend.room;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;
import com.workreserve.backend.room.DTO.RoomRequest;
import com.workreserve.backend.room.DTO.RoomResponse;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        return toResponse(room);
    }

    public RoomResponse createRoom(RoomRequest request) {
        Room room = new Room();
        room.setName(request.getName());
        room.setType(request.getType());
        room.setPricePerHour(request.getPricePerHour());
        room.setCapacity(request.getCapacity());
        Room saved = roomRepository.save(room);
        return toResponse(saved);
    }

    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        room.setName(request.getName());
        room.setType(request.getType());
        room.setPricePerHour(request.getPricePerHour());
        room.setCapacity(request.getCapacity());
        return toResponse(roomRepository.save(room));
    }

    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }
        roomRepository.deleteById(id);
    }

    private RoomResponse toResponse(Room room) {
        RoomResponse res = new RoomResponse();
        res.setId(room.getId());
        res.setName(room.getName());
        res.setType(room.getType());
        res.setPricePerHour(room.getPricePerHour());
        res.setCapacity(room.getCapacity());
        return res;
    }
}