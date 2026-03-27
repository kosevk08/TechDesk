package com.edutech.desk.controller.response;

import com.edutech.desk.ai.AiGuidanceLevel;

import java.util.List;

public class AiGuidanceResponse {
    private AiGuidanceLevel guidanceLevel;
    private String learningStatus;
    private String encouragement;
    private List<String> hints;
    private List<String> guidingQuestions;
    private List<String> practiceSuggestions;
    private String teacherEscalation;

    public AiGuidanceLevel getGuidanceLevel() { return guidanceLevel; }
    public void setGuidanceLevel(AiGuidanceLevel guidanceLevel) { this.guidanceLevel = guidanceLevel; }

    public String getLearningStatus() { return learningStatus; }
    public void setLearningStatus(String learningStatus) { this.learningStatus = learningStatus; }

    public String getEncouragement() { return encouragement; }
    public void setEncouragement(String encouragement) { this.encouragement = encouragement; }

    public List<String> getHints() { return hints; }
    public void setHints(List<String> hints) { this.hints = hints; }

    public List<String> getGuidingQuestions() { return guidingQuestions; }
    public void setGuidingQuestions(List<String> guidingQuestions) { this.guidingQuestions = guidingQuestions; }

    public List<String> getPracticeSuggestions() { return practiceSuggestions; }
    public void setPracticeSuggestions(List<String> practiceSuggestions) { this.practiceSuggestions = practiceSuggestions; }

    public String getTeacherEscalation() { return teacherEscalation; }
    public void setTeacherEscalation(String teacherEscalation) { this.teacherEscalation = teacherEscalation; }
}
