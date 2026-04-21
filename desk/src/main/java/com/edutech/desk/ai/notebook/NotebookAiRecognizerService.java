package com.edutech.desk.ai.notebook;

import com.edutech.desk.controller.request.NotebookAiAnalyzeRequest;
import org.springframework.stereotype.Service;

@Service
public class NotebookAiRecognizerService {

    public RecognitionResult recognize(NotebookAiAnalyzeRequest request) {
        RecognitionResult result = new RecognitionResult();
        String recognized = safe(request.getRecognizedText());

        if (!recognized.isBlank()) {
            result.setRecognizedText(recognized);
            result.setConfidence(0.92);
            return result;
        }

        if (request.getStrokeData() != null && !request.getStrokeData().isEmpty()) {
            result.setRecognizedText("");
            result.setConfidence(0.70);
            return result;
        }

        result.setRecognizedText("");
        result.setConfidence(0.0);
        return result;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}

