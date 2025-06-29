package com.workreserve.backend.timeslot.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BulkTimeSlotRequest {
    @NotEmpty
    @Valid
    private List<TimeSlotRequest> timeSlots;

    public List<TimeSlotRequest> getTimeSlots() { return timeSlots; }
    public void setTimeSlots(List<TimeSlotRequest> timeSlots) { this.timeSlots = timeSlots; }
}