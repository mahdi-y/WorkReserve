package com.workreserve.backend.timeslot.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class TimeSlotGenerationRequest {
    @NotNull
    private LocalDate startDate;
    
    @NotNull
    private LocalDate endDate;
    
    @NotNull
    private Long roomId;
    
    @NotEmpty
    @Valid
    private List<TimeSlotTemplate> timeSlots;
    
    private boolean repeatWeekly = false;
    private List<Integer> weekDays; 
    private boolean skipWeekends = false;
    private boolean skipHolidays = false;
    
    public static class TimeSlotTemplate {
        @NotNull
        private String startTime;
        
        @NotNull
        private String endTime;
        
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    
    public List<TimeSlotTemplate> getTimeSlots() { return timeSlots; }
    public void setTimeSlots(List<TimeSlotTemplate> timeSlots) { this.timeSlots = timeSlots; }
    
    public boolean isRepeatWeekly() { return repeatWeekly; }
    public void setRepeatWeekly(boolean repeatWeekly) { this.repeatWeekly = repeatWeekly; }
    
    public List<Integer> getWeekDays() { return weekDays; }
    public void setWeekDays(List<Integer> weekDays) { this.weekDays = weekDays; }
    
    public boolean isSkipWeekends() { return skipWeekends; }
    public void setSkipWeekends(boolean skipWeekends) { this.skipWeekends = skipWeekends; }
    
    public boolean isSkipHolidays() { return skipHolidays; }
    public void setSkipHolidays(boolean skipHolidays) { this.skipHolidays = skipHolidays; }
}