package com.edutech.desk.controller.response;

import com.edutech.desk.ai.AiAlertSeverity;

public class AiAlertResponse {
    private AiAlertSeverity severity;
    private String title;
    private String message;

    public AiAlertSeverity getSeverity() { return severity; }
    public void setSeverity(AiAlertSeverity severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
