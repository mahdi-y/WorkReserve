package com.workreserve.backend.timeslot.DTO;

import com.workreserve.backend.room.DTO.RoomResponse;
import java.time.LocalDate;
import java.time.LocalTime;

public class TimeSlotResponse {
    
    private Long id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private RoomResponse room;
    private boolean isAvailable;
    private boolean isBookedByCurrentUser;
    private String bookedByUserName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public RoomResponse getRoom() { return room; }
    public void setRoom(RoomResponse room) { this.room = room; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public boolean isBookedByCurrentUser() { return isBookedByCurrentUser; }
    public void setBookedByCurrentUser(boolean bookedByCurrentUser) { this.isBookedByCurrentUser = bookedByCurrentUser; }

    public String getBookedByUserName() { return bookedByUserName; }
    public void setBookedByUserName(String bookedByUserName) { this.bookedByUserName = bookedByUserName; }
}
