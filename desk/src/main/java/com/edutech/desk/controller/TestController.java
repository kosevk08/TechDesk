package com.edutech.desk.controller;

import com.edutech.desk.controller.request.TestAssignmentRequest;
import com.edutech.desk.controller.request.TestCreateRequest;
import com.edutech.desk.controller.request.TestGradeRequest;
import com.edutech.desk.controller.request.TestSubmissionRequest;
import com.edutech.desk.controller.response.ClassTestSummaryResponse;
import com.edutech.desk.controller.response.StudentTestResponse;
import com.edutech.desk.controller.response.TestDetailResponse;
import com.edutech.desk.controller.response.TestSubmissionResponse;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = {"http://localhost:3000", "https://techdesk-frontend.onrender.com"})
public class TestController {

    @Autowired
    private TestService testService;

    @Autowired
    private CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<TestDetailResponse> createTest(@RequestBody TestCreateRequest request) {
        return ResponseEntity.ok(testService.createTest(request));
    }

    @PostMapping("/{testId}/assign")
    public ResponseEntity<TestDetailResponse> assignTest(@PathVariable Long testId, @RequestBody TestAssignmentRequest request) {
        TestDetailResponse response = testService.assignTest(testId, request);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teacher/{egn}")
    public ResponseEntity<List<TestDetailResponse>> getTeacherTests(@PathVariable String egn) {
        return ResponseEntity.ok(testService.getTeacherTests(egn));
    }

    @GetMapping("/teacher/me")
    public ResponseEntity<List<TestDetailResponse>> getMyTeacherTests() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(testService.getTeacherTests(egn));
    }

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<StudentTestResponse>> getStudentTests(@PathVariable String egn) {
        return ResponseEntity.ok(testService.getStudentTests(egn));
    }

    @GetMapping("/student/me")
    public ResponseEntity<List<StudentTestResponse>> getMyTests() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(testService.getStudentTests(egn));
    }

    @PostMapping("/{testId}/submit")
    public ResponseEntity<TestSubmissionResponse> submitTest(@PathVariable Long testId, @RequestBody TestSubmissionRequest request) {
        return ResponseEntity.ok(testService.submitTest(testId, request));
    }

    @PostMapping("/submission/{submissionId}/grade")
    public ResponseEntity<TestSubmissionResponse> gradeSubmission(@PathVariable Long submissionId, @RequestBody TestGradeRequest request) {
        TestSubmissionResponse response = testService.gradeSubmission(submissionId, request);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/submissions/test/{testId}")
    public ResponseEntity<List<TestSubmissionResponse>> getSubmissionsByTest(@PathVariable Long testId) {
        return ResponseEntity.ok(testService.getSubmissionsByTest(testId));
    }

    @GetMapping("/results/student/{egn}")
    public ResponseEntity<List<TestSubmissionResponse>> getStudentResults(@PathVariable String egn) {
        return ResponseEntity.ok(testService.getStudentResults(egn));
    }

    @GetMapping("/results/me")
    public ResponseEntity<List<TestSubmissionResponse>> getMyResults() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(testService.getStudentResults(egn));
    }

    @GetMapping("/results/class/{className}")
    public ResponseEntity<List<ClassTestSummaryResponse>> getClassResults(@PathVariable String className) {
        return ResponseEntity.ok(testService.getClassResults(className));
    }

    @GetMapping("/classes")
    public ResponseEntity<List<String>> getClasses() {
        return ResponseEntity.ok(testService.getClasses());
    }
}
