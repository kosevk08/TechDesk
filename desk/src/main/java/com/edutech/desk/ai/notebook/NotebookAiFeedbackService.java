package com.edutech.desk.ai.notebook;

import org.springframework.stereotype.Service;

@Service
public class NotebookAiFeedbackService {

    public String buildFeedback(NotebookAiContext context, ProgressCheckResult progress, RecognitionResult recognition) {
        if (recognition.getConfidence() < 0.75) {
            return "I could not read the latest line clearly. Please write the last step more clearly.";
        }

        if ("not_started".equals(progress.getProgressStatus())) {
            return "Start with the first step and I will track your progress in real time.";
        }
        if ("started_with_errors".equals(progress.getProgressStatus())) {
            return "Good start. Check the first transformation carefully.";
        }
        if (progress.isFinalAnswerCorrect()) {
            return "Great work. Final answer is correct.";
        }
        if ("in_progress".equals(progress.getProgressStatus())) {
            int next = Math.min(progress.getLastCorrectStep() + 1, Math.max(1, progress.getTotalSteps()));
            return "You are on the right path. Continue with step " + next + ".";
        }
        return "Keep going. I am tracking your solution steps.";
    }
}

