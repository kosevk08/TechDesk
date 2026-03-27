package com.edutech.desk.controller.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AiGuidanceRequest {
    @NotBlank
    private String studentId;
    private String subject;
    private String concept;
    @NotBlank
    private String taskId;
    @NotNull
    @Min(0)
    private Long timeSpent;
    @NotNull
    @Min(0)
    private Integer attempts;
    @NotNull
    private Boolean correct;
    @Min(0)
    private Integer corrections;
    private Boolean skipped;

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getConcept() { return concept; }
    public void setConcept(String concept) { this.concept = concept; }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public Long getTimeSpent() { return timeSpent; }
    public void setTimeSpent(Long timeSpent) { this.timeSpent = timeSpent; }

    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }

    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }

    public Integer getCorrections() { return corrections; }
    public void setCorrections(Integer corrections) { this.corrections = corrections; }

    public Boolean getSkipped() { return skipped; }
    public void setSkipped(Boolean skipped) { this.skipped = skipped; }
}
