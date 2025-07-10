package com.workreserve.backend.activity;

import com.workreserve.backend.activity.DTO.ActivityResponse;
import com.workreserve.backend.user.User;
import com.workreserve.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    public void logActivity(String userEmail, String action, String entityType, Long entityId, String entityName) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
            Activity activity = new Activity(user, action, entityType, entityId, entityName);
            activityRepository.save(activity);
        }
    }

    public void logActivity(Long userId, String action, String entityType, Long entityId, String entityName) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            Activity activity = new Activity(user, action, entityType, entityId, entityName);
            activityRepository.save(activity);
        }
    }

    public List<ActivityResponse> getRecentActivityForUser(String email) {
        Pageable pageable = PageRequest.of(0, 10);
        List<Activity> activities = activityRepository.findByUserEmailOrderByCreatedAtDesc(email, pageable);
        
        return activities.stream()
                .map(this::toActivityResponse)
                .collect(Collectors.toList());
    }

    public List<ActivityResponse> getRecentActivityForUser(Long userId) {
        List<Activity> activities = activityRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        
        return activities.stream()
                .map(this::toActivityResponse)
                .collect(Collectors.toList());
    }

    public List<ActivityResponse> getRecentSystemActivity() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Activity> activities = activityRepository.findRecentSystemActivity(pageable);
        
        return activities.stream()
                .map(this::toActivityResponse)
                .collect(Collectors.toList());
    }

    private ActivityResponse toActivityResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setAction(activity.getAction());
        response.setEntityType(activity.getEntityType());
        response.setEntityId(activity.getEntityId());
        response.setEntityName(activity.getEntityName());
        response.setCreatedAt(activity.getCreatedAt());
        response.setTimeAgo(formatTimeAgo(activity.getCreatedAt()));
        
        return response;
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        if (minutes < 1) {
            return "Just now";
        } else if (minutes < 60) {
            return minutes + " minutes ago";
        }
        
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        if (hours < 24) {
            return hours + " hours ago";
        }
        
        long days = ChronoUnit.DAYS.between(dateTime, now);
        if (days < 7) {
            return days + " days ago";
        } else if (days < 30) {
            long weeks = days / 7;
            return weeks + " weeks ago";
        } else {
            long months = days / 30;
            return months + " months ago";
        }
    }
}