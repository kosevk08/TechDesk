package com.edutech.desk.controller.response;

import java.time.LocalDate;

public class AttendanceResponse {
    private String studentName;
    private LocalDate date;
    private String status;
    private String period;

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
}
