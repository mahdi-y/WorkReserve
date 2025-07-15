package com.workreserve.backend.auth.DTO;

import jakarta.validation.constraints.NotBlank;

public class TwoFactorVerificationRequest {
    @NotBlank(message = "Verification code is required")
    private String code;

    public TwoFactorVerificationRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}