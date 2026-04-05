package com.edutech.desk.serviceimpl;

import com.edutech.desk.controller.request.AiTaskDataRequest;
import com.edutech.desk.entities.AiTaskData;
import com.edutech.desk.repository.AiTaskDataRepository;
import com.edutech.desk.service.AITrackerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AITrackerServiceImpl implements AITrackerService {

    private static final Logger logger = LoggerFactory.getLogger(AITrackerServiceImpl.class);

    private final AiTaskDataRepository aiTaskDataRepository;

    public AITrackerServiceImpl(AiTaskDataRepository aiTaskDataRepository) {
        this.aiTaskDataRepository = aiTaskDataRepository;
    }

    @Override
    @Async("aiTrackingTaskExecutor")
    public void trackTaskData(AiTaskDataRequest request) {
        if (request == null) {
            logger.warn("AITrackerService - ignored null request");
            return;
        }

        if (!StringUtils.hasText(request.getStudentId()) || !StringUtils.hasText(request.getTaskId())) {
            logger.warn("AITrackerService - invalid request missing studentId/taskId: {}", request);
            return;
        }

        if (request.getTimeSpent() == null || request.getTimeSpent() < 0 || request.getAttempts() == null || request.getAttempts() < 0 || request.getCorrect() == null) {
            logger.warn("AITrackerService - invalid numeric inputs: {}", request);
            return;
        }

        try {
            AiTaskData record = new AiTaskData();
            record.setStudentId(request.getStudentId());
            record.setTaskId(request.getTaskId());
            record.setSubject(request.getSubject());
            record.setConcept(request.getConcept());
            record.setTimeSpent(request.getTimeSpent());
            record.setAttempts(request.getAttempts());
            record.setCorrect(request.getCorrect());
            record.setCorrections(request.getCorrections());
            record.setCompleted(request.getCompleted() != null ? request.getCompleted() : Boolean.TRUE);
            record.setSkipped(request.getSkipped() != null ? request.getSkipped() : Boolean.FALSE);

            aiTaskDataRepository.save(record);
            logger.info("AI task data tracked (student={}, task={})", request.getStudentId(), request.getTaskId());
        } catch (Exception ex) {
            logger.error("AITrackerService - failed to save task data asynchronously", ex);
        }
    }
}
