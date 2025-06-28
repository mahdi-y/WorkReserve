package com.workreserve.backend.timeslot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    
    List<TimeSlot> findByRoomIdAndDate(Long roomId, LocalDate date);
    
    List<TimeSlot> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.date >= :startDate AND ts.date <= :endDate " +
           "AND NOT EXISTS (SELECT r FROM Reservation r WHERE r.slot = ts AND r.status != 'CANCELLED')")
    List<TimeSlot> findAvailableTimeSlots(@Param("startDate") LocalDate startDate, 
                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.room.id = :roomId AND ts.date = :date " +
           "AND ((ts.startTime < :endTime AND ts.endTime > :startTime))")
    List<TimeSlot> findConflictingTimeSlots(@Param("roomId") Long roomId, 
                                           @Param("date") LocalDate date,
                                           @Param("startTime") LocalTime startTime, 
                                           @Param("endTime") LocalTime endTime);
    
    List<TimeSlot> findByRoomId(Long roomId);
    
    List<TimeSlot> findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(LocalDate date);

    @Query("""
        SELECT DISTINCT ts.room FROM TimeSlot ts
        WHERE ts.date = :date
          AND ts.startTime <= :startTime
          AND ts.endTime >= :endTime
          AND NOT EXISTS (
            SELECT r FROM Reservation r
            WHERE r.slot = ts AND r.status != 'CANCELLED'
          )
    """)
    List<com.workreserve.backend.room.Room> findAvailableRooms(
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
}