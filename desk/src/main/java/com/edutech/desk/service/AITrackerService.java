package com.edutech.desk.service;

import com.edutech.desk.controller.request.AiTaskDataRequest;

public interface AITrackerService {
    void trackTaskData(AiTaskDataRequest request);
}