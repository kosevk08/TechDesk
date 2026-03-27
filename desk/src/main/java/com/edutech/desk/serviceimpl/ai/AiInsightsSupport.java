package com.edutech.desk.serviceimpl.ai;

import com.edutech.desk.entities.AiTaskData;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

@Component
public class AiInsightsSupport {

    public String topicLabel(String concept, String subject, String taskId) {
        if (StringUtils.hasText(concept)) {
            return concept.trim();
        }
        if (StringUtils.hasText(subject)) {
            return subject.trim();
        }
        if (StringUtils.hasText(taskId)) {
            return taskId.trim();
        }
        return "Unspecified task";
    }

    public double avgLong(Collection<Long> values) {
        List<Long> filtered = values.stream().filter(value -> value != null).toList();
        if (filtered.isEmpty()) {
            return 0;
        }
        return filtered.stream().mapToLong(Long::longValue).average().orElse(0);
    }

    public double avgInt(Collection<Integer> values) {
        List<Integer> filtered = values.stream().filter(value -> value != null).toList();
        if (filtered.isEmpty()) {
            return 0;
        }
        return filtered.stream().mapToInt(Integer::intValue).average().orElse(0);
    }

    public double accuracy(List<AiTaskData> tasks) {
        if (tasks.isEmpty()) {
            return 0;
        }
        return tasks.stream().filter(task -> Boolean.TRUE.equals(task.getCorrect())).count() * 100.0 / tasks.size();
    }

    public long skippedCount(List<AiTaskData> tasks) {
        return tasks.stream().filter(task -> Boolean.TRUE.equals(task.getSkipped())).count();
    }

    public double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public List<AiTaskData> sortChronologically(List<AiTaskData> tasks) {
        return tasks.stream()
                .sorted(Comparator
                        .comparing(AiTaskData::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(AiTaskData::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }
}
