package com.edutech.desk.controller.response;

import java.time.LocalDateTime;
import java.util.List;

public class AiTeacherDashboardResponse {
    private AiClassOverviewResponse overview;
    private List<AiStudentInsightResponse> strugglingStudents;
    private List<AiTopicInsightResponse> topicInsights;
    private List<AiAlertResponse> alerts;
    private LocalDateTime generatedAt;

    public AiClassOverviewResponse getOverview() { return overview; }
    public void setOverview(AiClassOverviewResponse overview) { this.overview = overview; }

    public List<AiStudentInsightResponse> getStrugglingStudents() { return strugglingStudents; }
    public void setStrugglingStudents(List<AiStudentInsightResponse> strugglingStudents) { this.strugglingStudents = strugglingStudents; }

    public List<AiTopicInsightResponse> getTopicInsights() { return topicInsights; }
    public void setTopicInsights(List<AiTopicInsightResponse> topicInsights) { this.topicInsights = topicInsights; }

    public List<AiAlertResponse> getAlerts() { return alerts; }
    public void setAlerts(List<AiAlertResponse> alerts) { this.alerts = alerts; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
