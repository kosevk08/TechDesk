package com.edutech.desk.ai.notebook;

import com.edutech.desk.controller.request.NotebookAiAnalyzeRequest;
import com.edutech.desk.controller.response.NotebookAiAnalyzeResponse;
import com.edutech.desk.entities.NotebookAiRecord;
import com.edutech.desk.repository.NotebookAiRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotebookAiPipelineService {
    private final NotebookAiRecognizerService recognizerService;
    private final NotebookAiContextService contextService;
    private final NotebookAiProgressService progressService;
    private final NotebookAiFeedbackService feedbackService;
    private final NotebookAiRecordRepository notebookAiRecordRepository;

    public NotebookAiPipelineService(NotebookAiRecognizerService recognizerService,
                                     NotebookAiContextService contextService,
                                     NotebookAiProgressService progressService,
                                     NotebookAiFeedbackService feedbackService,
                                     NotebookAiRecordRepository notebookAiRecordRepository) {
        this.recognizerService = recognizerService;
        this.contextService = contextService;
        this.progressService = progressService;
        this.feedbackService = feedbackService;
        this.notebookAiRecordRepository = notebookAiRecordRepository;
    }

    public NotebookAiAnalyzeResponse analyze(NotebookAiAnalyzeRequest request) {
        RecognitionResult recognitionResult = recognizerService.recognize(request);
        NotebookAiContext context = contextService.buildContext(request, recognitionResult.getRecognizedText());
        ProgressCheckResult progress = progressService.evaluate(context);
        String feedback = feedbackService.buildFeedback(context, progress, recognitionResult);

        NotebookAiAnalyzeResponse response = new NotebookAiAnalyzeResponse();
        response.setSubjectDetectedFromContext(context.getSubject());
        response.setNotebookDetectedFromContext(context.getNotebook());
        response.setExerciseId(context.getExerciseId());
        response.setRecognizedText(recognitionResult.getRecognizedText());
        response.setRecognitionConfidence(recognitionResult.getConfidence());
        response.setProgressStatus(progress.getProgressStatus());
        response.setLastCorrectStep(progress.getLastCorrectStep());
        response.setTotalSteps(progress.getTotalSteps());
        response.setCompletionPercent(progress.getCompletionPercent());
        response.setFinalAnswerCorrect(progress.isFinalAnswerCorrect());
        response.setFeedback(feedback);
        response.setNeedsVisualConfirm(recognitionResult.getConfidence() < 0.75);
        response.setParsedStudentSteps(progress.getParsedStudentSteps());

        persistRecord(request, response);
        return response;
    }

    public Optional<NotebookAiAnalyzeResponse> latest(String studentId, String subjectId) {
        return notebookAiRecordRepository.findTopByStudentIdAndSubjectIdOrderByTimestampDesc(studentId, subjectId)
            .map(this::toResponse);
    }

    private void persistRecord(NotebookAiAnalyzeRequest request, NotebookAiAnalyzeResponse response) {
        NotebookAiRecord record = new NotebookAiRecord();
        record.setStudentId(valueOrFallback(request.getStudentId(), "unknown-student"));
        record.setSubjectId(valueOrFallback(request.getSubjectId(), "unknown-subject"));
        record.setNotebookId(valueOrFallback(request.getNotebookId(), "default-notebook"));
        record.setLessonId(valueOrFallback(request.getLessonId(), "default-lesson"));
        record.setExerciseId(valueOrFallback(request.getExerciseId(), "unknown-exercise"));
        record.setPageId(valueOrFallback(request.getPageId(), "unknown-page"));
        record.setTimestamp(LocalDateTime.now());
        record.setStrokeDataJson(toJsonStrokeData(request.getStrokeData()));
        record.setRecognizedText(valueOrFallback(response.getRecognizedText(), ""));
        record.setExpectedAnswer(valueOrFallback(request.getExpectedAnswer(), ""));
        record.setSolutionStepsJson(toJsonStringList(request.getSolutionSteps()));
        record.setRecognitionConfidence(response.getRecognitionConfidence() == null ? 0.0 : response.getRecognitionConfidence());
        record.setAnalysisJson(toJsonMap(Map.of(
            "progressStatus", response.getProgressStatus(),
            "lastCorrectStep", response.getLastCorrectStep(),
            "totalSteps", response.getTotalSteps(),
            "completionPercent", response.getCompletionPercent(),
            "finalAnswerCorrect", response.isFinalAnswerCorrect(),
            "feedback", valueOrFallback(response.getFeedback(), "")
        )));
        notebookAiRecordRepository.save(record);
    }

    private NotebookAiAnalyzeResponse toResponse(NotebookAiRecord record) {
        NotebookAiAnalyzeResponse response = new NotebookAiAnalyzeResponse();
        response.setSubjectDetectedFromContext(record.getSubjectId());
        response.setNotebookDetectedFromContext(record.getNotebookId());
        response.setExerciseId(record.getExerciseId());
        response.setRecognizedText(valueOrFallback(record.getRecognizedText(), ""));
        response.setRecognitionConfidence(record.getRecognitionConfidence());
        response.setFeedback("Loaded from latest stored notebook AI analysis.");
        response.setProgressStatus("latest_record");
        response.setLastCorrectStep(0);
        response.setTotalSteps(0);
        response.setCompletionPercent(0);
        response.setFinalAnswerCorrect(false);
        response.setNeedsVisualConfirm(false);
        return response;
    }

    private String toJsonStrokeData(List<NotebookAiAnalyzeRequest.StrokePoint> points) {
        if (points == null || points.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < points.size(); i++) {
            NotebookAiAnalyzeRequest.StrokePoint p = points.get(i);
            if (i > 0) sb.append(',');
            sb.append('{')
                .append("\"x\":").append(numberOrNull(p.getX())).append(',')
                .append("\"y\":").append(numberOrNull(p.getY())).append(',')
                .append("\"pressure\":").append(numberOrNull(p.getPressure())).append(',')
                .append("\"t\":").append(longOrNull(p.getT())).append(',')
                .append("\"strokeStart\":").append(boolOrNull(p.getStrokeStart())).append(',')
                .append("\"strokeEnd\":").append(boolOrNull(p.getStrokeEnd())).append(',')
                .append("\"zoneId\":\"").append(escapeJson(valueOrFallback(p.getZoneId(), ""))).append("\"")
                .append('}');
        }
        sb.append(']');
        return sb.toString();
    }

    private String toJsonStringList(List<String> values) {
        if (values == null || values.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append('"').append(escapeJson(valueOrFallback(values.get(i), ""))).append('"');
        }
        sb.append(']');
        return sb.toString();
    }

    private String toJsonMap(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return "{}";
        StringBuilder sb = new StringBuilder("{");
        int i = 0;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (i++ > 0) sb.append(',');
            sb.append('"').append(escapeJson(entry.getKey())).append('"').append(':');
            Object value = entry.getValue();
            if (value instanceof Number || value instanceof Boolean) {
                sb.append(String.valueOf(value));
            } else {
                sb.append('"').append(escapeJson(String.valueOf(value))).append('"');
            }
        }
        sb.append('}');
        return sb.toString();
    }

    private String valueOrFallback(String value, String fallback) {
        if (value == null) return fallback;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private String escapeJson(String value) {
        return value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private String numberOrNull(Double value) {
        return value == null ? "null" : String.valueOf(value);
    }

    private String longOrNull(Long value) {
        return value == null ? "null" : String.valueOf(value);
    }

    private String boolOrNull(Boolean value) {
        return value == null ? "null" : String.valueOf(value);
    }
}
