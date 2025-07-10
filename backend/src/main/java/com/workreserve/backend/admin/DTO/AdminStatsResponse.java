package com.workreserve.backend.admin.DTO;

public class AdminStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalRooms;
    private long totalReservations;
    private double monthlyGrowth;
    private double revenue;

    public AdminStatsResponse() {}

    public AdminStatsResponse(long totalUsers, long activeUsers, long totalRooms, 
                             long totalReservations, double monthlyGrowth, double revenue) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.totalRooms = totalRooms;
        this.totalReservations = totalReservations;
        this.monthlyGrowth = monthlyGrowth;
        this.revenue = revenue;
    }

    // Getters and setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    
    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    
    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }
    
    public long getTotalReservations() { return totalReservations; }
    public void setTotalReservations(long totalReservations) { this.totalReservations = totalReservations; }
    
    public double getMonthlyGrowth() { return monthlyGrowth; }
    public void setMonthlyGrowth(double monthlyGrowth) { this.monthlyGrowth = monthlyGrowth; }
    
    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }
}