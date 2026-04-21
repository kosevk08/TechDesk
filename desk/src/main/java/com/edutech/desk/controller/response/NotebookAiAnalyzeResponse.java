package com.edutech.desk.controller.response;

import java.util.ArrayList;
import java.util.List;

public class NotebookAiAnalyzeResponse {
    private String subjectDetectedFromContext;
    private String notebookDetectedFromContext;
    private String exerciseId;
    private String recognizedText;
    private Double recognitionConfidence;
    private String progressStatus;
    private int lastCorrectStep;
    private int totalSteps;
    private int completionPercent;
    private boolean finalAnswerCorrect;
    private String feedback;
    private boolean needsVisualConfirm;
    private List<String> parsedStudentSteps = new ArrayList<>();

    public String getSubjectDetectedFromContext() { return subjectDetectedFromContext; }
    public void setSubjectDetectedFromContext(String subjectDetectedFromContext) { this.subjectDetectedFromContext = subjectDetectedFromContext; }
    public String getNotebookDetectedFromContext() { return notebookDetectedFromContext; }
    public void setNotebookDetectedFromContext(String notebookDetectedFromContext) { this.notebookDetectedFromContext = notebookDetectedFromContext; }
    public String getExerciseId() { return exerciseId; }
    public void setExerciseId(String exerciseId) { this.exerciseId = exerciseId; }
    public String getRecognizedText() { return recognizedText; }
    public void setRecognizedText(String recognizedText) { this.recognizedText = recognizedText; }
    public Double getRecognitionConfidence() { return recognitionConfidence; }
    public void setRecognitionConfidence(Double recognitionConfidence) { this.recognitionConfidence = recognitionConfidence; }
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
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public boolean isNeedsVisualConfirm() { return needsVisualConfirm; }
    public void setNeedsVisualConfirm(boolean needsVisualConfirm) { this.needsVisualConfirm = needsVisualConfirm; }
    public List<String> getParsedStudentSteps() { return parsedStudentSteps; }
    public void setParsedStudentSteps(List<String> parsedStudentSteps) { this.parsedStudentSteps = parsedStudentSteps; }
}

