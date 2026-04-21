package com.edutech.desk.ai.notebook;

import com.edutech.desk.controller.request.NotebookAiAnalyzeRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotebookAiContextService {

    public NotebookAiContext buildContext(NotebookAiAnalyzeRequest request, String recognizedText) {
        NotebookAiContext context = new NotebookAiContext();
        context.setSubject(defaultValue(request.getSubjectId(), "unknown-subject"));
        context.setNotebook(defaultValue(request.getNotebookId(), "default-notebook"));
        context.setLesson(defaultValue(request.getLessonId(), "default-lesson"));
        context.setExerciseType(defaultValue(request.getExerciseType(), "generic"));
        context.setExpectedFinalAnswer(defaultValue(request.getExpectedAnswer(), ""));
        context.setExpectedSteps(copy(request.getSolutionSteps()));
        context.setStudentCurrentText(defaultValue(recognizedText, ""));
        context.setSubjectMode(defaultValue(request.getSubjectMode(), "generic"));
        context.setExerciseId(defaultValue(request.getExerciseId(), "unknown-exercise"));
        return context;
    }

    private String defaultValue(String value, String fallback) {
        if (value == null) return fallback;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private List<String> copy(List<String> items) {
        if (items == null) return new ArrayList<>();
        return new ArrayList<>(items);
    }
}

