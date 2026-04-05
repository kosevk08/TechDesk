package com.edutech.desk.controller.response;

public class AuthResponse {
    private String token;
    private UserPublicResponse user;

    public AuthResponse() {}

    public AuthResponse(String token, UserPublicResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserPublicResponse getUser() { return user; }
    public void setUser(UserPublicResponse user) { this.user = user; }
}
