package com.workreserve.backend.admin.DTO;

public class SystemActivityResponse {
    private Long id;
    private String action;
    private String entityType;
    private String entityName;
    private String timeAgo;

    public SystemActivityResponse() {}

    public SystemActivityResponse(Long id, String action, String entityType, String entityName, String timeAgo) {
        this.id = id;
        this.action = action;
        this.entityType = entityType;
        this.entityName = entityName;
        this.timeAgo = timeAgo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }
}