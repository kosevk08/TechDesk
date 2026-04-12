package com.edutech.desk.controller.request;

public class FeedbackRequest {
    private String message;
    private String page;
    private String severity;
    private String contact;
    private String url;
    private String clientTime;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPage() { return page; }
    public void setPage(String page) { this.page = page; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getClientTime() { return clientTime; }
    public void setClientTime(String clientTime) { this.clientTime = clientTime; }
}
