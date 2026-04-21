package com.edutech.desk.ai.notebook;

import com.edutech.desk.controller.request.NotebookAiAnalyzeRequest;
import com.edutech.desk.controller.response.NotebookAiAnalyzeResponse;
import com.edutech.desk.entities.NotebookAiRecord;
import com.edutech.desk.repository.NotebookAiRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        record.setStrokeDataJson(writeJsonSafe(request.getStrokeData()));
        record.setRecognizedText(valueOrFallback(response.getRecognizedText(), ""));
        record.setExpectedAnswer(valueOrFallback(request.getExpectedAnswer(), ""));
        record.setSolutionStepsJson(writeJsonSafe(request.getSolutionSteps()));
        record.setRecognitionConfidence(response.getRecognitionConfidence() == null ? 0.0 : response.getRecognitionConfidence());
        record.setAnalysisJson(writeJsonSafe(Map.of(
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

    private String writeJsonSafe(Object value) {
        if (value == null) return "{}";
        String text = String.valueOf(value);
        return text.isBlank() ? "{}" : text;
    }

    private String valueOrFallback(String value, String fallback) {
        if (value == null) return fallback;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }
}
