package com.workreserve.backend.admin;

import com.workreserve.backend.admin.DTO.AdminStatsResponse;
import com.workreserve.backend.user.UserRepository;
import com.workreserve.backend.room.RoomRepository;
import com.workreserve.backend.reservation.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

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
}