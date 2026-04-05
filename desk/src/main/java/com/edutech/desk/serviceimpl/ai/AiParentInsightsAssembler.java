package com.edutech.desk.serviceimpl.ai;

import com.edutech.desk.ai.AiEngagementLevel;
import com.edutech.desk.ai.AiProgressTrend;
import com.edutech.desk.controller.response.AiAttendanceSnapshotResponse;
import com.edutech.desk.controller.response.AiParentDashboardResponse;
import com.edutech.desk.entities.AiTaskData;
import com.edutech.desk.entities.Attendance;
import com.edutech.desk.entities.Student;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class AiParentInsightsAssembler {

    private final AiInsightsSupport support;

    public AiParentInsightsAssembler(AiInsightsSupport support) {
        this.support = support;
    }

    public AiParentDashboardResponse build(String studentId, Student student, List<AiTaskData> records, List<Attendance> attendanceRecords) {
        AiParentDashboardResponse response = new AiParentDashboardResponse();
        response.setStudentId(studentId);
        response.setStudentName(student != null ? student.getFirstName() + " " + student.getLastName() : studentId);
        response.setClassName(student != null ? student.getClassName() : "Unknown");
        response.setAccuracyRate(records.isEmpty() ? 0 : support.round(support.accuracy(records)));
        response.setAverageTimeSpentSeconds(support.round(support.avgLong(records.stream().map(AiTaskData::getTimeSpent).toList())));
        response.setAverageAttempts(support.round(support.avgInt(records.stream().map(AiTaskData::getAttempts).toList())));
        response.setSkippedTasks(support.skippedCount(records));
        response.setWeakSubjects(topSubjectAreas(records, true));
        response.setStrengths(topSubjectAreas(records, false));
        response.setProgressTrend(progressTrend(records));
        response.setEngagementLevel(parentEngagementLevel(records));
        response.setParentActions(buildParentActions(response));
        response.setAttendance(buildAttendanceSnapshot(attendanceRecords));
        return response;
    }

    private List<String> topSubjectAreas(List<AiTaskData> records, boolean weak) {
        Map<String, List<AiTaskData>> bySubject = records.stream()
                .collect(Collectors.groupingBy(task -> support.topicLabel(null, task.getSubject(), "General")));

        Comparator<Map.Entry<String, Double>> comparator = Map.Entry.comparingByValue();
        if (weak) {
            comparator = comparator.reversed();
        }

        return bySubject.entrySet().stream()
                .map(entry -> Map.entry(entry.getKey(), subjectScore(entry.getValue(), weak)))
                .sorted(comparator)
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();
    }

    private double subjectScore(List<AiTaskData> records, boolean weak) {
        double accuracy = support.accuracy(records);
        double avgAttempts = support.avgInt(records.stream().map(AiTaskData::getAttempts).toList());
        double avgTime = support.avgLong(records.stream().map(AiTaskData::getTimeSpent).toList());
        if (weak) {
            return (100 - accuracy) + (avgAttempts * 10) + (avgTime / 60.0);
        }
        return accuracy - (avgAttempts * 5) - (avgTime / 120.0);
    }

    private AiProgressTrend progressTrend(List<AiTaskData> records) {
        if (records.size() < 2) {
            return AiProgressTrend.BUILDING_BASELINE;
        }

        List<AiTaskData> sorted = support.sortChronologically(records);
        int midpoint = sorted.size() / 2;
        List<AiTaskData> firstHalf = sorted.subList(0, midpoint);
        List<AiTaskData> secondHalf = sorted.subList(midpoint, sorted.size());
        double earlyAccuracy = support.accuracy(firstHalf);
        double laterAccuracy = support.accuracy(secondHalf);

        if (laterAccuracy - earlyAccuracy >= 10) {
            return AiProgressTrend.IMPROVING;
        }
        if (earlyAccuracy - laterAccuracy >= 10) {
            return AiProgressTrend.NEEDS_ATTENTION;
        }
        return AiProgressTrend.STABLE;
    }

    private AiEngagementLevel parentEngagementLevel(List<AiTaskData> records) {
        if (records.isEmpty()) {
            return AiEngagementLevel.NO_ACTIVITY_YET;
        }

        long skipped = support.skippedCount(records);
        double avgAttempts = support.avgInt(records.stream().map(AiTaskData::getAttempts).toList());
        if (skipped >= 2 || avgAttempts >= 3.5) {
            return AiEngagementLevel.LOW;
        }
        if (skipped >= 1 || avgAttempts >= 2.5) {
            return AiEngagementLevel.MEDIUM;
        }
        return AiEngagementLevel.HIGH;
    }

    private List<String> buildParentActions(AiParentDashboardResponse response) {
        List<String> actions = new ArrayList<>();
        if (!response.getWeakSubjects().isEmpty()) {
            actions.add("Ask about " + response.getWeakSubjects().getFirst() + " and encourage your child to explain the method in their own words.");
        }
        if (response.getEngagementLevel() == AiEngagementLevel.LOW) {
            actions.add("Set a short, distraction-free study block and check in after one task rather than supervising every step.");
        }
        if (response.getProgressTrend() == AiProgressTrend.NEEDS_ATTENTION) {
            actions.add("Contact the teacher early to coordinate support before the struggle becomes a larger gap.");
        }
        if (actions.isEmpty()) {
            actions.add("Progress looks stable. Keep encouraging regular practice and reflection after each study session.");
        }
        return actions;
    }

    private AiAttendanceSnapshotResponse buildAttendanceSnapshot(List<Attendance> records) {
        AiAttendanceSnapshotResponse response = new AiAttendanceSnapshotResponse();
        response.setTotalRecords(records.size());
        response.setPresentCount(records.stream().filter(record -> "PRESENT".equalsIgnoreCase(record.getStatus())).count());
        response.setAbsentCount(records.stream().filter(record -> "ABSENT".equalsIgnoreCase(record.getStatus())).count());
        response.setLatestStatus(records.stream()
                .sorted(Comparator.comparing(Attendance::getDate).reversed())
                .map(Attendance::getStatus)
                .findFirst()
                .orElse("No attendance recorded"));
        return response;
    }
}
