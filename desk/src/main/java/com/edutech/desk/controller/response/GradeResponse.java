package com.edutech.desk.controller.response;

import java.time.LocalDateTime;

public class GradeResponse {
    private String studentName;
    private String subject;
    private Double value;
    private String comment;
    private LocalDateTime createdAt;

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
