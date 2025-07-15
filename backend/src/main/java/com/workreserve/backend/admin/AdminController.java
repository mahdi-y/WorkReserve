package com.workreserve.backend.admin;

import com.workreserve.backend.admin.DTO.AdminStatsResponse;
import com.workreserve.backend.admin.DTO.MonthlyStatsResponse;
import com.workreserve.backend.admin.DTO.RoomUsageStatsResponse;
import com.workreserve.backend.admin.DTO.SystemActivityResponse;
import com.workreserve.backend.admin.DTO.UserGrowthStatsResponse;
import com.workreserve.backend.admin.DTO.DailyActivityStatsResponse;
import com.workreserve.backend.admin.DTO.WeeklyRevenueStatsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        AdminStatsResponse stats = adminService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<SystemActivityResponse>> getRecentSystemActivity() {
        List<SystemActivityResponse> activities = adminService.getRecentSystemActivity();
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/analytics/monthly-stats")
    public ResponseEntity<List<MonthlyStatsResponse>> getMonthlyStats() {
        List<MonthlyStatsResponse> stats = adminService.getMonthlyStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/room-usage")
    public ResponseEntity<List<RoomUsageStatsResponse>> getRoomUsageStats() {
        List<RoomUsageStatsResponse> stats = adminService.getRoomUsageStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/user-growth")
    public ResponseEntity<List<UserGrowthStatsResponse>> getUserGrowthStats() {
        List<UserGrowthStatsResponse> stats = adminService.getUserGrowthStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/daily-activity")
    public ResponseEntity<List<DailyActivityStatsResponse>> getDailyActivityStats() {
        List<DailyActivityStatsResponse> stats = adminService.getDailyActivityStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/weekly-revenue")
    public ResponseEntity<List<WeeklyRevenueStatsResponse>> getWeeklyRevenueStats() {
        List<WeeklyRevenueStatsResponse> stats = adminService.getWeeklyRevenueStats();
        return ResponseEntity.ok(stats);
    }
}