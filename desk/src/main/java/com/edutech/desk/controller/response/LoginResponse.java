package com.edutech.desk.controller.response;

public class LoginResponse {
    private String token;
    private String role;
    private boolean demo;
    private String displayName;
    private String egn;
    private String email;
    private String className;
    private String childName;
    private String childClassName;
    private String studentEgn;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isDemo() { return demo; }
    public void setDemo(boolean demo) { this.demo = demo; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getEgn() { return egn; }
    public void setEgn(String egn) { this.egn = egn; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getChildName() { return childName; }
    public void setChildName(String childName) { this.childName = childName; }
    public String getChildClassName() { return childClassName; }
    public void setChildClassName(String childClassName) { this.childClassName = childClassName; }
    public String getStudentEgn() { return studentEgn; }
    public void setStudentEgn(String studentEgn) { this.studentEgn = studentEgn; }
}
