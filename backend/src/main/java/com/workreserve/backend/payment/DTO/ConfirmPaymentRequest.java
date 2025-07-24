package com.workreserve.backend.payment.DTO;

import jakarta.validation.constraints.NotNull;

public class ConfirmPaymentRequest {
    @NotNull
    private String paymentIntentId;
    
    @NotNull
    private Long slotId;
    
    @NotNull
    private Integer teamSize;

    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public Integer getTeamSize() { return teamSize; }
    public void setTeamSize(Integer teamSize) { this.teamSize = teamSize; }
}