package com.workreserve.backend.user.DTO;

public class AuthResponseToken {
    private String token;
    private String refreshToken;
    private UserResponse user;

    public AuthResponseToken(String token, String refreshToken, UserResponse user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public AuthResponseToken(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = null;
    }

    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
}
