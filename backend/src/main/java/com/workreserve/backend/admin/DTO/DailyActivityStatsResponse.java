package com.workreserve.backend.admin.DTO;

public class DailyActivityStatsResponse {
    private String hour;
    private int bookings;

    public DailyActivityStatsResponse() {}

    public DailyActivityStatsResponse(String hour, int bookings) {
        this.hour = hour;
        this.bookings = bookings;
    }

    public String getHour() { return hour; }
    public void setHour(String hour) { this.hour = hour; }

    public int getBookings() { return bookings; }
    public void setBookings(int bookings) { this.bookings = bookings; }
}