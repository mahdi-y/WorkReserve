package com.workreserve.backend.auth.DTO;

import java.util.List;

public class TwoFactorSetupResponse {
    private String secret;
    private String otpAuthUri;
    private List<String> backupCodes;

    public TwoFactorSetupResponse(String secret, String otpAuthUri, List<String> backupCodes) {
        this.secret = secret;
        this.otpAuthUri = otpAuthUri;
        this.backupCodes = backupCodes;
    }

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public String getOtpAuthUri() { return otpAuthUri; }
    public void setOtpAuthUri(String otpAuthUri) { this.otpAuthUri = otpAuthUri; }

    public List<String> getBackupCodes() { return backupCodes; }
    public void setBackupCodes(List<String> backupCodes) { this.backupCodes = backupCodes; }
}