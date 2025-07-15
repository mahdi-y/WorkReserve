package com.workreserve.backend.admin.DTO;

public class WeeklyRevenueStatsResponse {
    private String day;
    private double revenue;

    public WeeklyRevenueStatsResponse() {}

    public WeeklyRevenueStatsResponse(String day, double revenue) {
        this.day = day;
        this.revenue = revenue;
    }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }
}