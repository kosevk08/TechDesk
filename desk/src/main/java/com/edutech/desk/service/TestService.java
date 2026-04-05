package com.edutech.desk.service;

import com.edutech.desk.controller.request.TestAssignmentRequest;
import com.edutech.desk.controller.request.TestCreateRequest;
import com.edutech.desk.controller.request.TestGradeRequest;
import com.edutech.desk.controller.request.TestSubmissionRequest;
import com.edutech.desk.controller.response.ClassTestSummaryResponse;
import com.edutech.desk.controller.response.StudentTestResponse;
import com.edutech.desk.controller.response.TestDetailResponse;
import com.edutech.desk.controller.response.TestSubmissionResponse;
import java.util.List;

public interface TestService {
    TestDetailResponse createTest(TestCreateRequest request);
    TestDetailResponse assignTest(Long testId, TestAssignmentRequest request);
    List<TestDetailResponse> getTeacherTests(String teacherEgn);
    List<StudentTestResponse> getStudentTests(String studentEgn);
    TestSubmissionResponse submitTest(Long testId, TestSubmissionRequest request);
    TestSubmissionResponse gradeSubmission(Long submissionId, TestGradeRequest request);
    List<TestSubmissionResponse> getSubmissionsByTest(Long testId);
    List<TestSubmissionResponse> getStudentResults(String studentEgn);
    List<ClassTestSummaryResponse> getClassResults(String className);
    List<String> getClasses();
}
