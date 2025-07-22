package com.workreserve.backend.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    boolean existsBySlotIdAndStatusNot(Long slotId, ReservationStatus status);
    Optional<Reservation> findByUserIdAndSlotId(Long userId, Long slotId);
    @Query("SELECT COALESCE(SUM(r.totalCost), 0.0) FROM Reservation r")
    Double sumTotalCost();
    List<Reservation> findBySlotIdAndStatusNot(Long slotId, ReservationStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(r.totalCost), 0.0) FROM Reservation r WHERE r.createdAt BETWEEN :start AND :end")
    Double sumTotalCostByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CAST(r.slot.room.type AS string) as roomType, COUNT(r) as count FROM Reservation r GROUP BY r.slot.room.type")
    List<Object[]> getRoomTypeUsageCounts();

    default Map<String, Long> countReservationsByRoomType() {
        List<Object[]> results = getRoomTypeUsageCounts();
        Map<String, Long> roomTypeCounts = new HashMap<>();

        for (Object[] result : results) {
            String roomType = (String) result[0];
            Long count = (Long) result[1];
            roomTypeCounts.put(roomType, count);
        }

        return roomTypeCounts;
    }

    @Query("SELECT r FROM Reservation r " +
           "LEFT JOIN FETCH r.slot s " +
           "LEFT JOIN FETCH s.room " +
           "LEFT JOIN FETCH r.user " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findAllWithSlotAndUser();

    @Query("SELECT r FROM Reservation r " +
           "LEFT JOIN FETCH r.slot s " +
           "LEFT JOIN FETCH s.room " +
           "LEFT JOIN FETCH r.user " +
           "WHERE r.user.id = :userId " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findByUserIdWithSlotAndUser(@Param("userId") Long userId);

    List<Reservation> findAllByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date);

    boolean existsBySlotId(Long slotId);
}