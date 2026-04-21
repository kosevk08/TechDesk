package com.edutech.desk.ai.notebook;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotebookAiProgressService {

    public ProgressCheckResult evaluate(NotebookAiContext context) {
        ProgressCheckResult result = new ProgressCheckResult();
        List<String> studentSteps = parseSteps(context.getStudentCurrentText());
        List<String> expectedSteps = context.getExpectedSteps() == null ? List.of() : context.getExpectedSteps();

        result.setParsedStudentSteps(studentSteps);
        result.setTotalSteps(expectedSteps.size());

        if (studentSteps.isEmpty()) {
            result.setProgressStatus("not_started");
            result.setLastCorrectStep(0);
            result.setCompletionPercent(0);
            result.setFinalAnswerCorrect(false);
            return result;
        }

        int lastCorrectStep = 0;
        int maxComparable = Math.min(studentSteps.size(), expectedSteps.size());
        for (int i = 0; i < maxComparable; i++) {
            if (equivalent(studentSteps.get(i), expectedSteps.get(i))) {
                lastCorrectStep = i + 1;
            } else {
                break;
            }
        }

        result.setLastCorrectStep(lastCorrectStep);
        boolean finalCorrect = isFinalAnswerCorrect(context, studentSteps);
        result.setFinalAnswerCorrect(finalCorrect);

        if (expectedSteps.isEmpty()) {
            result.setCompletionPercent(finalCorrect ? 100 : 50);
            result.setProgressStatus(finalCorrect ? "completed" : "in_progress");
            return result;
        }

        int percent = (int) Math.round((lastCorrectStep * 100.0) / expectedSteps.size());
        if (finalCorrect) percent = 100;
        result.setCompletionPercent(Math.max(0, Math.min(percent, 100)));

        if (finalCorrect || lastCorrectStep >= expectedSteps.size()) {
            result.setProgressStatus("completed");
        } else if (lastCorrectStep == 0) {
            result.setProgressStatus("started_with_errors");
        } else {
            result.setProgressStatus("in_progress");
        }

        return result;
    }

    private boolean isFinalAnswerCorrect(NotebookAiContext context, List<String> studentSteps) {
        String expected = normalize(context.getExpectedFinalAnswer());
        if (expected.isEmpty()) return false;
        String wholeText = normalize(context.getStudentCurrentText());
        if (wholeText.contains(expected)) return true;
        if (!studentSteps.isEmpty()) {
            String lastStep = normalize(studentSteps.get(studentSteps.size() - 1));
            return equivalent(lastStep, expected);
        }
        return false;
    }

    private List<String> parseSteps(String text) {
        if (text == null || text.isBlank()) return List.of();
        String[] lines = text.split("\\r?\\n");
        List<String> steps = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line == null ? "" : line.trim();
            if (!trimmed.isEmpty()) {
                steps.add(trimmed);
            }
        }
        return steps;
    }

    private boolean equivalent(String left, String right) {
        return normalize(left).equals(normalize(right));
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.toLowerCase()
            .replaceAll("\\s+", "")
            .replace("−", "-")
            .replace("–", "-");
    }
}

