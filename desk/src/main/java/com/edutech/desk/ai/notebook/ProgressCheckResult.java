package com.edutech.desk.ai.notebook;

import java.util.ArrayList;
import java.util.List;

public class ProgressCheckResult {
    private String progressStatus;
    private int lastCorrectStep;
    private int totalSteps;
    private int completionPercent;
    private boolean finalAnswerCorrect;
    private List<String> parsedStudentSteps = new ArrayList<>();

    public String getProgressStatus() { return progressStatus; }
    public void setProgressStatus(String progressStatus) { this.progressStatus = progressStatus; }
    public int getLastCorrectStep() { return lastCorrectStep; }
    public void setLastCorrectStep(int lastCorrectStep) { this.lastCorrectStep = lastCorrectStep; }
    public int getTotalSteps() { return totalSteps; }
    public void setTotalSteps(int totalSteps) { this.totalSteps = totalSteps; }
    public int getCompletionPercent() { return completionPercent; }
    public void setCompletionPercent(int completionPercent) { this.completionPercent = completionPercent; }
    public boolean isFinalAnswerCorrect() { return finalAnswerCorrect; }
    public void setFinalAnswerCorrect(boolean finalAnswerCorrect) { this.finalAnswerCorrect = finalAnswerCorrect; }
    public List<String> getParsedStudentSteps() { return parsedStudentSteps; }
    public void setParsedStudentSteps(List<String> parsedStudentSteps) { this.parsedStudentSteps = parsedStudentSteps; }
}

