package com.workreserve.backend.reservation.DTO;

import jakarta.validation.constraints.NotNull;

public class ReservationRequest {
    @NotNull
    private Long slotId;
    @NotNull
    private Integer teamSize;

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public Integer getTeamSize() { return teamSize; }
    public void setTeamSize(Integer teamSize) { this.teamSize = teamSize; }
}