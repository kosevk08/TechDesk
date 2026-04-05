package com.edutech.desk.controller.response;

public class UserPublicResponse {
    private String displayName;
    private String role;
    private boolean demo;
    private String className;
    private String childName;
    private String childClassName;

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isDemo() { return demo; }
    public void setDemo(boolean demo) { this.demo = demo; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getChildName() { return childName; }
    public void setChildName(String childName) { this.childName = childName; }
    public String getChildClassName() { return childClassName; }
    public void setChildClassName(String childClassName) { this.childClassName = childClassName; }
}
