package com.edutech.desk.controller.request;

import java.util.ArrayList;
import java.util.List;

public class NotebookAiAnalyzeRequest {
    private String studentId;
    private String subjectId;
    private String notebookId;
    private String lessonId;
    private String exerciseId;
    private String pageId;
    private List<StrokePoint> strokeData = new ArrayList<>();
    private String recognizedText;
    private String expectedAnswer;
    private List<String> solutionSteps = new ArrayList<>();
    private String exerciseType;
    private String subjectMode;

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    public String getNotebookId() { return notebookId; }
    public void setNotebookId(String notebookId) { this.notebookId = notebookId; }
    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getExerciseId() { return exerciseId; }
    public void setExerciseId(String exerciseId) { this.exerciseId = exerciseId; }
    public String getPageId() { return pageId; }
    public void setPageId(String pageId) { this.pageId = pageId; }
    public List<StrokePoint> getStrokeData() { return strokeData; }
    public void setStrokeData(List<StrokePoint> strokeData) { this.strokeData = strokeData; }
    public String getRecognizedText() { return recognizedText; }
    public void setRecognizedText(String recognizedText) { this.recognizedText = recognizedText; }
    public String getExpectedAnswer() { return expectedAnswer; }
    public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }
    public List<String> getSolutionSteps() { return solutionSteps; }
    public void setSolutionSteps(List<String> solutionSteps) { this.solutionSteps = solutionSteps; }
    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }
    public String getSubjectMode() { return subjectMode; }
    public void setSubjectMode(String subjectMode) { this.subjectMode = subjectMode; }

    public static class StrokePoint {
        private Double x;
        private Double y;
        private Double pressure;
        private Long t;
        private Boolean strokeStart;
        private Boolean strokeEnd;
        private String zoneId;

        public Double getX() { return x; }
        public void setX(Double x) { this.x = x; }
        public Double getY() { return y; }
        public void setY(Double y) { this.y = y; }
        public Double getPressure() { return pressure; }
        public void setPressure(Double pressure) { this.pressure = pressure; }
        public Long getT() { return t; }
        public void setT(Long t) { this.t = t; }
        public Boolean getStrokeStart() { return strokeStart; }
        public void setStrokeStart(Boolean strokeStart) { this.strokeStart = strokeStart; }
        public Boolean getStrokeEnd() { return strokeEnd; }
        public void setStrokeEnd(Boolean strokeEnd) { this.strokeEnd = strokeEnd; }
        public String getZoneId() { return zoneId; }
        public void setZoneId(String zoneId) { this.zoneId = zoneId; }
    }
}

