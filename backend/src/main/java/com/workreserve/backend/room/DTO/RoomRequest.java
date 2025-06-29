package com.workreserve.backend.room.DTO;

import jakarta.validation.constraints.*;
import com.workreserve.backend.room.RoomType;

public class RoomRequest {
    @NotBlank
    private String name;

    @NotNull
    private RoomType type;

    @NotNull @Positive
    private Double pricePerHour;

    @NotNull @Positive
    private Integer capacity;

    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public RoomType getType() { return type; }
    public void setType(RoomType type) { this.type = type; }

    public Double getPricePerHour() { return pricePerHour; }
    public void setPricePerHour(Double pricePerHour) { this.pricePerHour = pricePerHour; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}