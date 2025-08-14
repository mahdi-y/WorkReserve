package com.workreserve.backend.reservation.DTO;

import java.time.LocalDateTime;

public class NearestReservationResponse {
    private Long id;
    private String roomName;
    private LocalDateTime startAt;

    public NearestReservationResponse() {}

    public NearestReservationResponse(Long id, String roomName, LocalDateTime startAt) {
        this.id = id;
        this.roomName = roomName;
        this.startAt = startAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public LocalDateTime getStartAt() { return startAt; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
}