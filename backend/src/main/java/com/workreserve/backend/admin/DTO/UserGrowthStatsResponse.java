package com.workreserve.backend.admin.DTO;

public class UserGrowthStatsResponse {
    private String month;
    private int users;

    public UserGrowthStatsResponse() {}

    public UserGrowthStatsResponse(String month, int users) {
        this.month = month;
        this.users = users;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public int getUsers() { return users; }
    public void setUsers(int users) { this.users = users; }
}