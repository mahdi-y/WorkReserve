package com.workreserve.backend.admin.DTO;

public class MonthlyStatsResponse {
    private String month;
    private int reservations;
    private double revenue;

    public MonthlyStatsResponse() {}

    public MonthlyStatsResponse(String month, int reservations, double revenue) {
        this.month = month;
        this.reservations = reservations;
        this.revenue = revenue;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public int getReservations() { return reservations; }
    public void setReservations(int reservations) { this.reservations = reservations; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }
}