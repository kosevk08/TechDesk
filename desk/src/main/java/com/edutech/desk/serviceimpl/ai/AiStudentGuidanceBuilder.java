package com.edutech.desk.serviceimpl.ai;

import com.edutech.desk.ai.AiGuidanceLevel;
import com.edutech.desk.config.AIInsightsProperties;
import com.edutech.desk.controller.request.AiGuidanceRequest;
import com.edutech.desk.controller.response.AiGuidanceResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AiStudentGuidanceBuilder {

    private final AIInsightsProperties properties;
    private final AiInsightsSupport support;

    public AiStudentGuidanceBuilder(AIInsightsProperties properties, AiInsightsSupport support) {
        this.properties = properties;
        this.support = support;
    }

    public AiGuidanceResponse build(AiGuidanceRequest request) {
        AiGuidanceResponse response = new AiGuidanceResponse();
        int pressureScore = guidancePressureScore(request);
        String focusArea = support.topicLabel(request.getConcept(), request.getSubject(), request.getTaskId());

        if (pressureScore <= properties.getGuidance().getMediumScoreAtMost()) {
            response.setGuidanceLevel(AiGuidanceLevel.LIGHT);
            response.setLearningStatus("You appear to be progressing well.");
            response.setEncouragement("Keep going and explain the next step to yourself before writing it down.");
            response.setHints(List.of(
                    "Re-read the instruction and identify the exact quantity or idea the task is asking for.",
                    "Underline the information you already know before you continue.",
                    "Check whether your current approach matches the topic: " + focusArea + "."
            ));
            response.setGuidingQuestions(List.of(
                    "What is the first small step you can do without solving the whole problem?",
                    "Which rule, formula, or definition applies here?",
                    "How will you verify your result once you finish?"
            ));
            response.setPracticeSuggestions(List.of(
                    "Try one similar task at the same difficulty.",
                    "Summarize the method you used in one sentence."
            ));
            response.setTeacherEscalation("Not needed right now.");
            return response;
        }

        if (pressureScore <= properties.getGuidance().getHighScoreAtMost()) {
            response.setGuidanceLevel(AiGuidanceLevel.MEDIUM);
            response.setLearningStatus("The pattern suggests some hesitation, but the task is still within reach.");
            response.setEncouragement("Slow down and focus on one checkpoint at a time. You do not need the full answer immediately.");
            response.setHints(List.of(
                    "Break the task into input, method, and expected output before continuing.",
                    "Write the first correct intermediate step only, then pause and check it.",
                    "Compare this attempt with your previous one and spot the earliest place where they differ."
            ));
            response.setGuidingQuestions(List.of(
                    "Which part feels uncertain: understanding the question, choosing a method, or checking the result?",
                    "What do you already know that can reduce the problem to a smaller one?",
                    "If you had to teach the first step to a classmate, what would you say?"
            ));
            response.setPracticeSuggestions(List.of(
                    "Retry the same concept with a smaller example.",
                    "Use one worked note or textbook example, but adapt it yourself rather than copying it."
            ));
            response.setTeacherEscalation("Monitor if the next attempt is still incorrect or much slower than average.");
            return response;
        }

        response.setGuidanceLevel(AiGuidanceLevel.HIGH);
        response.setLearningStatus("The student is likely struggling and needs structured support without receiving the answer.");
        response.setEncouragement("Take a short reset, then return to the first reliable fact in the task. We build from there.");
        response.setHints(List.of(
                "Stop trying full solutions for a moment and list only the facts, symbols, or conditions given in the task.",
                "Choose one micro-step that can be completed in under a minute.",
                "After each step, ask: does this move me closer to the target or am I repeating the same pattern?"
        ));
        response.setGuidingQuestions(List.of(
                "What exactly is confusing right now?",
                "Which prerequisite idea might need review before this task becomes manageable?",
                "What single checkpoint would prove you are back on the right track?"
        ));
        response.setPracticeSuggestions(List.of(
                "Switch to a simpler practice task on the same concept before returning.",
                "Review teacher notes or textbook examples specifically for " + focusArea + ".",
                "Ask the teacher for a worked first step, not the completed solution."
        ));
        response.setTeacherEscalation("Teacher attention recommended if the pattern continues or the student skips the task.");
        return response;
    }

    /**
     * Implementation for the "Explain Like I'm 5" feature.
     */
    public AiGuidanceResponse buildEli5(String subject, String topic) {
        AiGuidanceResponse response = new AiGuidanceResponse();
        response.setGuidanceLevel(AiGuidanceLevel.LIGHT);
        response.setLearningStatus("Simplifying " + topic + " for you!");
        response.setEncouragement("Think of this like a game or a daily activity.");
        response.setHints(List.of("Imagine " + topic + " is like sharing a pizza with friends...", 
                                  "It works just like putting toys in different boxes."));
        response.setTeacherEscalation("None - self-guided exploration.");
        return response;
    }

    /**
     * Feature 4: Teacher AI Assistant
     * Generates a structured lesson plan for a teacher.
     */
    public String generateLessonPlan(String subject, String topic) {
        return String.format("""
            Lesson Plan: %s
            Subject: %s
            1. Concept Intro: Define %s with real-world examples.
            2. Guided Practice: 3 exercises of increasing difficulty.
            3. AI Checkpoint: Quick quiz to trigger the Weakness Radar.
            """, topic, subject, topic);
    }

    private int guidancePressureScore(AiGuidanceRequest request) {
        AIInsightsProperties.Guidance guidance = properties.getGuidance();
        int score = 0;
        if (request.getTimeSpent() != null && request.getTimeSpent() >= guidance.getMediumTimeSecondsAtLeast()) score++;
        if (request.getAttempts() != null && request.getAttempts() >= guidance.getMediumAttemptsAtLeast()) score++;
        if (request.getAttempts() != null && request.getAttempts() >= guidance.getHighAttemptsAtLeast()) score++;
        if (Boolean.FALSE.equals(request.getCorrect())) score++;
        if (request.getCorrections() != null && request.getCorrections() >= guidance.getCorrectionPressureAtLeast()) score++;
        if (Boolean.TRUE.equals(request.getSkipped())) score += 2;
        return score;
    }
}
