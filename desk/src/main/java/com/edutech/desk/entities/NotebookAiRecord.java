package com.edutech.desk.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notebook_ai_records")
public class NotebookAiRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String subjectId;

    @Column(nullable = false)
    private String notebookId;

    @Column(nullable = false)
    private String lessonId;

    @Column(nullable = false)
    private String exerciseId;

    @Column(nullable = false)
    private String pageId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(columnDefinition = "LONGTEXT")
    private String strokeDataJson;

    @Column(columnDefinition = "LONGTEXT")
    private String recognizedText;

    @Column(columnDefinition = "LONGTEXT")
    private String expectedAnswer;

    @Column(columnDefinition = "LONGTEXT")
    private String solutionStepsJson;

    @Column(nullable = false)
    private Double recognitionConfidence = 0.0;

    @Column(columnDefinition = "LONGTEXT")
    private String analysisJson;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getStrokeDataJson() { return strokeDataJson; }
    public void setStrokeDataJson(String strokeDataJson) { this.strokeDataJson = strokeDataJson; }
    public String getRecognizedText() { return recognizedText; }
    public void setRecognizedText(String recognizedText) { this.recognizedText = recognizedText; }
    public String getExpectedAnswer() { return expectedAnswer; }
    public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }
    public String getSolutionStepsJson() { return solutionStepsJson; }
    public void setSolutionStepsJson(String solutionStepsJson) { this.solutionStepsJson = solutionStepsJson; }
    public Double getRecognitionConfidence() { return recognitionConfidence; }
    public void setRecognitionConfidence(Double recognitionConfidence) { this.recognitionConfidence = recognitionConfidence; }
    public String getAnalysisJson() { return analysisJson; }
    public void setAnalysisJson(String analysisJson) { this.analysisJson = analysisJson; }
}

