package com.workreserve.backend.user.DTO;

public class AuthResponseToken {
    private String token;
    private String refreshToken;

    public AuthResponseToken(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
    }
    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
}
