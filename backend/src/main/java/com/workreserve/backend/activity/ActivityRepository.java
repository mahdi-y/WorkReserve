package com.workreserve.backend.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<Activity> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);
    
    @Query("SELECT a FROM Activity a WHERE a.user.email = :email ORDER BY a.createdAt DESC")
    List<Activity> findByUserEmailOrderByCreatedAtDesc(@Param("email") String email, org.springframework.data.domain.Pageable pageable);
    
    List<Activity> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT a FROM Activity a ORDER BY a.createdAt DESC")
    List<Activity> findRecentSystemActivity(org.springframework.data.domain.Pageable pageable);
    
    @Query("SELECT a FROM Activity a WHERE a.entityType = :entityType ORDER BY a.createdAt DESC")
    List<Activity> findByEntityTypeOrderByCreatedAtDesc(@Param("entityType") String entityType, org.springframework.data.domain.Pageable pageable);
}