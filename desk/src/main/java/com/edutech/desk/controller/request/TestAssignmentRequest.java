package com.edutech.desk.controller.request;

public class TestAssignmentRequest {
    private String className;
    private String dueDate;
    private String assignedByEgn;

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getAssignedByEgn() { return assignedByEgn; }
    public void setAssignedByEgn(String assignedByEgn) { this.assignedByEgn = assignedByEgn; }
}
