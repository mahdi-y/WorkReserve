package com.workreserve.backend.admin;

import com.workreserve.backend.admin.DTO.*;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import com.workreserve.backend.reservation.Reservation;
import com.workreserve.backend.reservation.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private TimeSlotRepository timeSlotRepository;

    public AdminStatsResponse getAdminStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabledTrue();
        long totalRooms = roomRepository.count();
        long totalReservations = reservationRepository.count();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonth = now.minusMonths(1);
        long thisMonthUsers = userRepository.countByCreatedAtAfter(lastMonth);
        long previousMonthUsers = userRepository.countByCreatedAtBetween(
            lastMonth.minusMonths(1), lastMonth);
        
        double monthlyGrowth = previousMonthUsers > 0 ? 
            ((double)(thisMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 : 0;
        
        Double revenue = reservationRepository.sumTotalCost();
        if (revenue == null) revenue = 0.0;
        
        return new AdminStatsResponse(totalUsers, activeUsers, totalRooms, 
                                    totalReservations, monthlyGrowth, revenue);
    }

    public List<MonthlyStatsResponse> getMonthlyStats() {
        List<MonthlyStatsResponse> monthlyStats = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusNanos(1);
            
            long reservationCount = reservationRepository.countByCreatedAtBetween(monthStart, monthEnd);
            Double revenue = reservationRepository.sumTotalCostByCreatedAtBetween(monthStart, monthEnd);
            if (revenue == null) revenue = 0.0;
            
            String monthName = monthStart.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);
            monthlyStats.add(new MonthlyStatsResponse(monthName, (int) reservationCount, revenue));
        }
        
        return monthlyStats;
    }

    public List<RoomUsageStatsResponse> getRoomUsageStats() {
        List<RoomUsageStatsResponse> roomUsageStats = new ArrayList<>();
        String[] colors = {"#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0"};
        
        Map<String, Long> roomTypeCounts = reservationRepository.countReservationsByRoomType();
        
        int colorIndex = 0;
        for (Map.Entry<String, Long> entry : roomTypeCounts.entrySet()) {
            String roomTypeName = formatRoomTypeName(entry.getKey());
            String color = colors[colorIndex % colors.length];
            roomUsageStats.add(new RoomUsageStatsResponse(roomTypeName, entry.getValue().intValue(), color));
            colorIndex++;
        }
        
        return roomUsageStats;
    }

    public List<UserGrowthStatsResponse> getUserGrowthStats() {
        List<UserGrowthStatsResponse> userGrowthStats = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusNanos(1);
            
            long userCount = userRepository.countByCreatedAtBefore(monthEnd);
            String monthName = monthStart.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);
            
            userGrowthStats.add(new UserGrowthStatsResponse(monthName, (int) userCount));
        }
        
        return userGrowthStats;
    }

    public List<DailyActivityStatsResponse> getDailyActivityStats() {
        List<DailyActivityStatsResponse> dailyActivityStats = new ArrayList<>();
        
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime tomorrow = today.plusDays(1);
        
        for (int hour = 8; hour <= 18; hour++) {
            LocalDateTime hourStart = today.withHour(hour);
            LocalDateTime hourEnd = hourStart.plusHours(1);
            
            long bookingCount = reservationRepository.countByCreatedAtBetween(hourStart, hourEnd);
            String hourString = String.format("%02d:00", hour);
            
            dailyActivityStats.add(new DailyActivityStatsResponse(hourString, (int) bookingCount));
        }
        
        return dailyActivityStats;
    }

    public List<WeeklyRevenueStatsResponse> getWeeklyRevenueStats() {
        List<WeeklyRevenueStatsResponse> weeklyRevenueStats = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.with(java.time.DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        
        for (int i = 0; i < 7; i++) {
            LocalDateTime dayStart = weekStart.plusDays(i);
            LocalDateTime dayEnd = dayStart.plusDays(1).minusNanos(1);
            
            Double revenue = reservationRepository.sumTotalCostByCreatedAtBetween(dayStart, dayEnd);
            if (revenue == null) revenue = 0.0;
            
            weeklyRevenueStats.add(new WeeklyRevenueStatsResponse(dayNames[i], revenue));
        }
        
        return weeklyRevenueStats;
    }

    public List<SystemActivityResponse> getRecentSystemActivity() {
        List<SystemActivityResponse> activities = new ArrayList<>();
        
        try {
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
            List<Reservation> recentReservations = reservationRepository.findAllByCreatedAtAfterOrderByCreatedAtDesc(oneWeekAgo);
            
            for (Reservation reservation : recentReservations.stream().limit(5).collect(Collectors.toList())) {
                String timeAgo = getTimeAgo(reservation.getCreatedAt());
                String roomName = reservation.getSlot() != null && reservation.getSlot().getRoom() != null 
                    ? reservation.getSlot().getRoom().getName() 
                    : "Unknown Room";
                    
                activities.add(new SystemActivityResponse(
                    reservation.getId(),
                    "New reservation created for " + roomName,
                    "RESERVATION",
                    roomName,
                    timeAgo
                ));
            }
            
            List<User> recentUsers = userRepository.findAllByCreatedAtAfterOrderByCreatedAtDesc(oneWeekAgo);
            
            for (User user : recentUsers.stream().limit(3).collect(Collectors.toList())) {
                String timeAgo = getTimeAgo(user.getCreatedAt());
                activities.add(new SystemActivityResponse(
                    user.getId(),
                    "New user registered: " + user.getFullName(),
                    "USER",
                    user.getFullName(),
                    timeAgo
                ));
            }
            
            activities.sort((a, b) -> b.getId().compareTo(a.getId()));
            
        } catch (Exception e) {
            activities.add(new SystemActivityResponse(1L, "System started", "SYSTEM", "WorkReserve", "1 hour ago"));
        }
        
        return activities.stream().limit(10).collect(Collectors.toList());
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);
        
        if (minutes < 60) {
            return minutes + " minutes ago";
        } else if (hours < 24) {
            return hours + " hours ago";
        } else {
            return days + " days ago";
        }
    }

    private String formatRoomTypeName(String roomType) {
        switch (roomType) {
            case "HOT_DESK": return "Hot Desks";
            case "DEDICATED_DESK": return "Dedicated Desks";
            case "CONFERENCE_ROOM": return "Conference Rooms";
            case "PRIVATE_OFFICE": return "Private Offices";
            default: return roomType.replace("_", " ");
        }
    }
}