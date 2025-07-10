package com.workreserve.backend.activity;

import com.workreserve.backend.activity.DTO.ActivityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/users/recent-activity")
    public ResponseEntity<List<ActivityResponse>> getRecentActivity(Authentication authentication) {
        String userEmail = authentication.getName();
        List<ActivityResponse> activities = activityService.getRecentActivityForUser(userEmail);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/admin/recent-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityResponse>> getRecentSystemActivity() {
        List<ActivityResponse> activities = activityService.getRecentSystemActivity();
        return ResponseEntity.ok(activities);
    }
}