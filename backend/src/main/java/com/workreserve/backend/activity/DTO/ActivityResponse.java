package com.workreserve.backend.activity.DTO;

import java.time.LocalDateTime;

public class ActivityResponse {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String entityName;
    private LocalDateTime createdAt;
    private String timeAgo;

    public ActivityResponse() {}

    public ActivityResponse(Long id, String action, String entityType, Long entityId, 
                           String entityName, LocalDateTime createdAt, String timeAgo) {
        this.id = id;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.entityName = entityName;
        this.createdAt = createdAt;
        this.timeAgo = timeAgo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getTimeAgo() {
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }
}