package com.workreserve.backend.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    boolean existsBySlotIdAndStatusNot(Long slotId, ReservationStatus status);
    Optional<Reservation> findByUserIdAndSlotId(Long userId, Long slotId);
    @Query("SELECT SUM(r.totalCost) FROM Reservation r WHERE r.status != 'CANCELLED'")
    Double sumTotalCost();
    List<Reservation> findBySlotIdAndStatusNot(Long slotId, ReservationStatus status);
}