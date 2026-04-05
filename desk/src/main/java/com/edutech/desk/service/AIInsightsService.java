package com.edutech.desk.service;

import com.edutech.desk.controller.request.AiGuidanceRequest;
import com.edutech.desk.controller.response.AiGuidanceResponse;
import com.edutech.desk.controller.response.AiParentDashboardResponse;
import com.edutech.desk.controller.response.AiTeacherDashboardResponse;

public interface AIInsightsService {
    AiTeacherDashboardResponse buildTeacherDashboard();
    AiParentDashboardResponse buildParentDashboard(String studentId);
    AiGuidanceResponse buildStudentGuidance(AiGuidanceRequest request);
}
