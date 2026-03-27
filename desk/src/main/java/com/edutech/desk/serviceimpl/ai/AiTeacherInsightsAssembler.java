package com.edutech.desk.serviceimpl.ai;

import com.edutech.desk.ai.AiAdaptiveRecommendation;
import com.edutech.desk.ai.AiAlertSeverity;
import com.edutech.desk.ai.AiDifficultyLevel;
import com.edutech.desk.ai.AiRiskLevel;
import com.edutech.desk.config.AIInsightsProperties;
import com.edutech.desk.controller.response.AiAlertResponse;
import com.edutech.desk.controller.response.AiClassOverviewResponse;
import com.edutech.desk.controller.response.AiStudentInsightResponse;
import com.edutech.desk.controller.response.AiTeacherDashboardResponse;
import com.edutech.desk.controller.response.AiTopicInsightResponse;
import com.edutech.desk.entities.AiTaskData;
import com.edutech.desk.entities.Student;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class AiTeacherInsightsAssembler {

    private final AIInsightsProperties properties;
    private final AiInsightsSupport support;

    public AiTeacherInsightsAssembler(AIInsightsProperties properties, AiInsightsSupport support) {
        this.properties = properties;
        this.support = support;
    }

    public AiTeacherDashboardResponse build(List<AiTaskData> tasks, Map<String, Student> studentsById) {
        AiTeacherDashboardResponse response = new AiTeacherDashboardResponse();
        response.setOverview(buildOverview(tasks, studentsById));
        List<AiStudentInsightResponse> studentInsights = buildStudentInsights(tasks, studentsById);
        response.setStrugglingStudents(studentInsights.stream()
                .filter(this::needsAttention)
                .sorted(Comparator.comparing(AiStudentInsightResponse::getRiskLevel).reversed()
                        .thenComparing(AiStudentInsightResponse::getAccuracyRate))
                .limit(6)
                .toList());
        response.setTopicInsights(buildTopicInsights(tasks));
        response.setAlerts(buildAlerts(studentInsights, response.getTopicInsights(), response.getOverview()));
        response.setGeneratedAt(LocalDateTime.now());
        return response;
    }

    public List<AiStudentInsightResponse> buildStudentInsights(List<AiTaskData> tasks, Map<String, Student> studentsById) {
        Map<String, List<AiTaskData>> grouped = tasks.stream().collect(Collectors.groupingBy(AiTaskData::getStudentId));
        List<AiStudentInsightResponse> insights = new ArrayList<>();

        for (Map.Entry<String, List<AiTaskData>> entry : grouped.entrySet()) {
            String studentId = entry.getKey();
            List<AiTaskData> records = entry.getValue();
            Student student = studentsById.get(studentId);

            AiStudentInsightResponse insight = new AiStudentInsightResponse();
            insight.setStudentId(studentId);
            insight.setStudentName(student != null ? student.getFirstName() + " " + student.getLastName() : studentId);
            insight.setClassName(student != null ? student.getClassName() : "Unknown");
            insight.setAverageTimeSpentSeconds(support.round(support.avgLong(records.stream().map(AiTaskData::getTimeSpent).toList())));
            insight.setAverageAttempts(support.round(support.avgInt(records.stream().map(AiTaskData::getAttempts).toList())));
            insight.setAccuracyRate(support.round(support.accuracy(records)));
            insight.setSkippedTasks(support.skippedCount(records));
            insight.setWeaknessAreas(topWeaknessAreas(records));
            insight.setRiskLevel(studentRiskLevel(records));
            insight.setAdaptiveRecommendation(adaptiveRecommendation(records));
            insight.setRecommendedAction(recommendedStudentAction(insight));
            insights.add(insight);
        }

        return insights;
    }

    public AiRiskLevel studentRiskLevel(List<AiTaskData> records) {
        AIInsightsProperties.Risk risk = properties.getRisk();
        double avgAttempts = support.avgInt(records.stream().map(AiTaskData::getAttempts).toList());
        double accuracy = support.accuracy(records);
        long skipped = support.skippedCount(records);
        double avgTime = support.avgLong(records.stream().map(AiTaskData::getTimeSpent).toList());

        if (accuracy < risk.getHighAccuracyBelow()
                || avgAttempts >= risk.getHighAttemptsAtLeast()
                || avgTime >= risk.getHighTimeSecondsAtLeast()
                || skipped >= risk.getHighSkippedAtLeast()) {
            return AiRiskLevel.HIGH;
        }
        if (accuracy < risk.getMediumAccuracyBelow()
                || avgAttempts >= risk.getMediumAttemptsAtLeast()
                || avgTime >= risk.getMediumTimeSecondsAtLeast()
                || skipped >= risk.getMediumSkippedAtLeast()) {
            return AiRiskLevel.MEDIUM;
        }
        return AiRiskLevel.LOW;
    }

    public AiAdaptiveRecommendation adaptiveRecommendation(List<AiTaskData> records) {
        AIInsightsProperties.Risk risk = properties.getRisk();
        if (studentRiskLevel(records) == AiRiskLevel.HIGH) {
            return AiAdaptiveRecommendation.MORE_PRACTICE;
        }

        double accuracy = support.accuracy(records);
        double avgAttempts = support.avgInt(records.stream().map(AiTaskData::getAttempts).toList());
        if (accuracy >= risk.getIncreaseDifficultyAccuracyAtLeast()
                && avgAttempts <= risk.getIncreaseDifficultyAttemptsAtMost()) {
            return AiAdaptiveRecommendation.INCREASE_DIFFICULTY;
        }
        return AiAdaptiveRecommendation.MAINTAIN_PACE;
    }

    public AiDifficultyLevel difficultyLevel(List<AiTaskData> records) {
        AIInsightsProperties.Difficulty difficulty = properties.getDifficulty();
        double avgTime = support.avgLong(records.stream().map(AiTaskData::getTimeSpent).toList());
        double avgAttempts = support.avgInt(records.stream().map(AiTaskData::getAttempts).toList());
        double accuracy = support.accuracy(records);
        long skipped = support.skippedCount(records);

        int score = 0;
        if (avgTime >= difficulty.getMediumTimeSecondsAtLeast()) score++;
        if (avgTime >= difficulty.getDifficultTimeSecondsAtLeast()) score++;
        if (avgAttempts >= difficulty.getMediumAttemptsAtLeast()) score++;
        if (avgAttempts >= difficulty.getDifficultAttemptsAtLeast()) score++;
        if (accuracy < difficulty.getMediumAccuracyBelow()) score++;
        if (accuracy < difficulty.getDifficultAccuracyBelow()) score++;
        if (skipped > 0) score++;

        if (score >= difficulty.getDifficultScoreAtLeast()) {
            return AiDifficultyLevel.DIFFICULT;
        }
        if (score >= difficulty.getMediumScoreAtLeast()) {
            return AiDifficultyLevel.MEDIUM;
        }
        return AiDifficultyLevel.EASY;
    }

    private AiClassOverviewResponse buildOverview(List<AiTaskData> tasks, Map<String, Student> studentsById) {
        AiClassOverviewResponse overview = new AiClassOverviewResponse();
        overview.setTotalTasks(tasks.size());
        overview.setCompletedTasks(tasks.stream().filter(task -> !Boolean.TRUE.equals(task.getSkipped())).count());
        overview.setSkippedTasks(support.skippedCount(tasks));
        overview.setAverageTimeSpentSeconds(support.round(support.avgLong(tasks.stream().map(AiTaskData::getTimeSpent).toList())));
        overview.setAverageAttempts(support.round(support.avgInt(tasks.stream().map(AiTaskData::getAttempts).toList())));
        overview.setAccuracyRate(tasks.isEmpty() ? 0 : support.round(support.accuracy(tasks)));

        List<AiStudentInsightResponse> insights = buildStudentInsights(tasks, studentsById);
        overview.setStrugglingStudentsCount(insights.stream().filter(this::needsAttention).count());
        overview.setAttentionAlertsCount(insights.stream().filter(insight -> insight.getRiskLevel() == AiRiskLevel.HIGH).count());
        return overview;
    }

    private boolean needsAttention(AiStudentInsightResponse insight) {
        return insight.getRiskLevel() == AiRiskLevel.HIGH || insight.getRiskLevel() == AiRiskLevel.MEDIUM;
    }

    private String recommendedStudentAction(AiStudentInsightResponse insight) {
        if (insight.getRiskLevel() == AiRiskLevel.HIGH) {
            return "Provide step-by-step teacher guidance and assign focused follow-up practice.";
        }
        if (insight.getRiskLevel() == AiRiskLevel.MEDIUM) {
            return "Offer a hint-based intervention and check the next task closely.";
        }
        return "Student is stable. Continue with normal progression.";
    }

    private List<String> topWeaknessAreas(List<AiTaskData> records) {
        Map<String, Long> counts = records.stream()
                .filter(task -> !Boolean.TRUE.equals(task.getCorrect()) || task.getAttempts() >= 3 || Boolean.TRUE.equals(task.getSkipped()))
                .collect(Collectors.groupingBy(task -> support.topicLabel(task.getConcept(), task.getSubject(), task.getTaskId()), Collectors.counting()));

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();
    }

    private List<AiTopicInsightResponse> buildTopicInsights(List<AiTaskData> tasks) {
        Map<String, List<AiTaskData>> grouped = tasks.stream()
                .collect(Collectors.groupingBy(task -> support.topicLabel(task.getConcept(), task.getSubject(), task.getTaskId())));

        return grouped.entrySet().stream()
                .map(entry -> {
                    List<AiTaskData> records = entry.getValue();
                    AiTopicInsightResponse response = new AiTopicInsightResponse();
                    response.setLabel(entry.getKey());
                    response.setSubject(records.stream()
                            .map(AiTaskData::getSubject)
                            .filter(StringUtils::hasText)
                            .findFirst()
                            .orElse("General"));
                    response.setTotalInteractions(records.size());
                    response.setAverageTimeSpentSeconds(support.round(support.avgLong(records.stream().map(AiTaskData::getTimeSpent).toList())));
                    response.setAverageAttempts(support.round(support.avgInt(records.stream().map(AiTaskData::getAttempts).toList())));
                    response.setAccuracyRate(records.isEmpty() ? 0 : support.round(support.accuracy(records)));
                    response.setDifficultyLevel(difficultyLevel(records));
                    response.setTeacherAction(topicAction(response));
                    return response;
                })
                .sorted(Comparator.comparing(AiTopicInsightResponse::getDifficultyLevel).reversed()
                        .thenComparing(AiTopicInsightResponse::getAccuracyRate))
                .limit(8)
                .toList();
    }

    private String topicAction(AiTopicInsightResponse topic) {
        if (topic.getDifficultyLevel() == AiDifficultyLevel.DIFFICULT) {
            return "Re-teach this topic with guided examples and short checkpoint questions.";
        }
        if (topic.getDifficultyLevel() == AiDifficultyLevel.MEDIUM) {
            return "Add one reinforcement activity and monitor the next round of attempts.";
        }
        return "Students are coping well. Consider a slightly more challenging extension task.";
    }

    private List<AiAlertResponse> buildAlerts(List<AiStudentInsightResponse> students, List<AiTopicInsightResponse> topics,
                                              AiClassOverviewResponse overview) {
        List<AiAlertResponse> alerts = new ArrayList<>();

        students.stream()
                .filter(insight -> insight.getRiskLevel() == AiRiskLevel.HIGH)
                .limit(3)
                .forEach(insight -> alerts.add(alert(
                        AiAlertSeverity.HIGH,
                        "Student needs attention",
                        insight.getStudentName() + " is showing repeated struggle patterns. " + insight.getRecommendedAction()
                )));

        topics.stream()
                .filter(topic -> topic.getDifficultyLevel() == AiDifficultyLevel.DIFFICULT)
                .limit(2)
                .forEach(topic -> alerts.add(alert(
                        AiAlertSeverity.MEDIUM,
                        "Topic difficulty rising",
                        topic.getLabel() + " has low accuracy and should be revisited with guided examples."
                )));

        if (overview.getSkippedTasks() > 0) {
            alerts.add(alert(
                    AiAlertSeverity.MEDIUM,
                    "Task engagement drop detected",
                    overview.getSkippedTasks() + " tracked tasks were skipped. Consider a quick teacher check-in."
            ));
        }

        return alerts;
    }

    private AiAlertResponse alert(AiAlertSeverity severity, String title, String message) {
        AiAlertResponse response = new AiAlertResponse();
        response.setSeverity(severity);
        response.setTitle(title);
        response.setMessage(message);
        return response;
    }
}
