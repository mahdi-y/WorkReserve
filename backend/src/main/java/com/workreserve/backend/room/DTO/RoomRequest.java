package com.workreserve.backend.room.DTO;

import jakarta.validation.constraints.*;

import java.util.ArrayList;
import java.util.List;

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

    @Size(max = 10, message = "Maximum 10 images allowed")
    private List<String> imageUrls = new ArrayList<>();

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

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}