package com.edutech.desk.ai.notebook;

import java.util.ArrayList;
import java.util.List;

public class NotebookAiContext {
    private String subject;
    private String notebook;
    private String lesson;
    private String exerciseType;
    private String expectedFinalAnswer;
    private List<String> expectedSteps = new ArrayList<>();
    private String studentCurrentText;
    private String subjectMode;
    private String exerciseId;

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getNotebook() { return notebook; }
    public void setNotebook(String notebook) { this.notebook = notebook; }
    public String getLesson() { return lesson; }
    public void setLesson(String lesson) { this.lesson = lesson; }
    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }
    public String getExpectedFinalAnswer() { return expectedFinalAnswer; }
    public void setExpectedFinalAnswer(String expectedFinalAnswer) { this.expectedFinalAnswer = expectedFinalAnswer; }
    public List<String> getExpectedSteps() { return expectedSteps; }
    public void setExpectedSteps(List<String> expectedSteps) { this.expectedSteps = expectedSteps; }
    public String getStudentCurrentText() { return studentCurrentText; }
    public void setStudentCurrentText(String studentCurrentText) { this.studentCurrentText = studentCurrentText; }
    public String getSubjectMode() { return subjectMode; }
    public void setSubjectMode(String subjectMode) { this.subjectMode = subjectMode; }
    public String getExerciseId() { return exerciseId; }
    public void setExerciseId(String exerciseId) { this.exerciseId = exerciseId; }
}

