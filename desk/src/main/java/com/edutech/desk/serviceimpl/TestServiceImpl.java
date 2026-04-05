package com.edutech.desk.serviceimpl;

import com.edutech.desk.controller.request.TestAssignmentRequest;
import com.edutech.desk.controller.request.TestCreateRequest;
import com.edutech.desk.controller.request.TestGradeRequest;
import com.edutech.desk.controller.request.TestSubmissionRequest;
import com.edutech.desk.controller.response.ClassTestSummaryResponse;
import com.edutech.desk.controller.response.StudentTestResponse;
import com.edutech.desk.controller.response.TestAssignmentInfo;
import com.edutech.desk.controller.response.TestDetailResponse;
import com.edutech.desk.controller.response.TestSubmissionResponse;
import com.edutech.desk.entities.Student;
import com.edutech.desk.entities.Test;
import com.edutech.desk.entities.TestAssignment;
import com.edutech.desk.entities.TestSubmission;
import com.edutech.desk.repository.StudentRepository;
import com.edutech.desk.repository.TestAssignmentRepository;
import com.edutech.desk.repository.TestRepository;
import com.edutech.desk.repository.TestSubmissionRepository;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestServiceImpl implements TestService {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private TestAssignmentRepository assignmentRepository;

    @Autowired
    private TestSubmissionRepository submissionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private CurrentUserService currentUserService;

    @Override
    public TestDetailResponse createTest(TestCreateRequest request) {
        String creatorEgn = request.getCreatedByEgn();
        if (creatorEgn == null || creatorEgn.isBlank()) {
            creatorEgn = currentUserService.getEgn();
        }
        Test test = new Test();
        test.setTitle(request.getTitle());
        test.setSubject(request.getSubject());
        test.setDescription(request.getDescription());
        test.setQuestionsJson(request.getQuestionsJson());
        test.setTotalPoints(request.getTotalPoints());
        test.setCreatedByEgn(creatorEgn);
        test.setCreatedAt(LocalDateTime.now());
        Test saved = testRepository.save(test);
        return toDetailResponse(saved, Collections.emptyList());
    }

    @Override
    public TestDetailResponse assignTest(Long testId, TestAssignmentRequest request) {
        String assignedEgn = request.getAssignedByEgn();
        if (assignedEgn == null || assignedEgn.isBlank()) {
            assignedEgn = currentUserService.getEgn();
        }
        TestAssignment assignment = new TestAssignment();
        assignment.setTestId(testId);
        assignment.setClassName(request.getClassName());
        assignment.setAssignedByEgn(assignedEgn);
        assignment.setAssignedAt(LocalDateTime.now());
        if (request.getDueDate() != null && !request.getDueDate().isBlank()) {
            assignment.setDueDate(LocalDate.parse(request.getDueDate()));
        }
        assignmentRepository.save(assignment);
        Test test = testRepository.findById(testId).orElse(null);
        List<TestAssignment> assignments = assignmentRepository.findByTestId(testId);
        return test != null ? toDetailResponse(test, assignments) : null;
    }

    @Override
    public List<TestDetailResponse> getTeacherTests(String teacherEgn) {
        List<Test> tests = testRepository.findByCreatedByEgn(teacherEgn);
        return tests.stream()
            .map(test -> toDetailResponse(test, assignmentRepository.findByTestId(test.getId())))
            .collect(Collectors.toList());
    }

    @Override
    public List<StudentTestResponse> getStudentTests(String studentEgn) {
        Optional<Student> studentOpt = studentRepository.findById(studentEgn);
        if (studentOpt.isEmpty()) return Collections.emptyList();

        String className = studentOpt.get().getClassName();
        List<TestAssignment> assignments = assignmentRepository.findByClassName(className);
        Map<Long, TestSubmission> submissionMap = submissionRepository.findByStudentEgn(studentEgn)
            .stream()
            .collect(Collectors.toMap(TestSubmission::getTestId, s -> s, (a, b) -> b));

        return assignments.stream()
            .map(assignment -> {
                Test test = testRepository.findById(assignment.getTestId()).orElse(null);
                if (test == null) return null;
                TestSubmission submission = submissionMap.get(test.getId());
                StudentTestResponse response = new StudentTestResponse();
                response.setTestId(test.getId());
                response.setAssignmentId(assignment.getId());
                response.setTitle(test.getTitle());
                response.setSubject(test.getSubject());
                response.setDescription(test.getDescription());
                response.setQuestionsJson(test.getQuestionsJson());
                response.setTotalPoints(test.getTotalPoints());
                response.setDueDate(assignment.getDueDate());
                if (submission != null) {
                    response.setSubmissionId(submission.getId());
                    response.setStatus(submission.getStatus());
                    response.setScore(submission.getScore());
                    response.setFeedback(submission.getFeedback());
                } else {
                    response.setStatus("ASSIGNED");
                }
                return response;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    @Override
    public TestSubmissionResponse submitTest(Long testId, TestSubmissionRequest request) {
        String studentEgn = request.getStudentEgn();
        if (studentEgn == null || studentEgn.isBlank()) {
            studentEgn = currentUserService.getEgn();
        }
        TestSubmission submission = submissionRepository
            .findByTestIdAndStudentEgn(testId, studentEgn)
            .orElseGet(TestSubmission::new);
        submission.setTestId(testId);
        submission.setStudentEgn(studentEgn);
        submission.setAnswersJson(request.getAnswersJson());
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus("SUBMITTED");
        TestSubmission saved = submissionRepository.save(submission);
        return toSubmissionResponse(saved);
    }

    @Override
    public TestSubmissionResponse gradeSubmission(Long submissionId, TestGradeRequest request) {
        Optional<TestSubmission> existing = submissionRepository.findById(submissionId);
        if (existing.isEmpty()) return null;
        TestSubmission submission = existing.get();
        submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setStatus("GRADED");
        submission.setGradedAt(LocalDateTime.now());
        TestSubmission saved = submissionRepository.save(submission);
        return toSubmissionResponse(saved);
    }

    @Override
    public List<TestSubmissionResponse> getSubmissionsByTest(Long testId) {
        return submissionRepository.findByTestId(testId)
            .stream()
            .map(this::toSubmissionResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<TestSubmissionResponse> getStudentResults(String studentEgn) {
        return submissionRepository.findByStudentEgn(studentEgn)
            .stream()
            .map(this::toSubmissionResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<ClassTestSummaryResponse> getClassResults(String className) {
        List<TestAssignment> assignments = assignmentRepository.findByClassName(className);
        List<ClassTestSummaryResponse> results = new ArrayList<>();
        for (TestAssignment assignment : assignments) {
            Test test = testRepository.findById(assignment.getTestId()).orElse(null);
            if (test == null) continue;
            List<TestSubmission> submissions = submissionRepository.findByTestId(test.getId());
            int graded = (int) submissions.stream().filter(s -> "GRADED".equalsIgnoreCase(s.getStatus())).count();
            ClassTestSummaryResponse response = new ClassTestSummaryResponse();
            response.setTestId(test.getId());
            response.setTitle(test.getTitle());
            response.setClassName(assignment.getClassName());
            response.setDueDate(assignment.getDueDate());
            response.setSubmissionsCount(submissions.size());
            response.setGradedCount(graded);
            results.add(response);
        }
        return results;
    }

    @Override
    public List<String> getClasses() {
        return studentRepository.findAll()
            .stream()
            .map(Student::getClassName)
            .filter(Objects::nonNull)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }

    private TestDetailResponse toDetailResponse(Test test, List<TestAssignment> assignments) {
        TestDetailResponse response = new TestDetailResponse();
        response.setId(test.getId());
        response.setTitle(test.getTitle());
        response.setSubject(test.getSubject());
        response.setDescription(test.getDescription());
        response.setQuestionsJson(test.getQuestionsJson());
        response.setTotalPoints(test.getTotalPoints());
        response.setCreatedAt(test.getCreatedAt());
        if (assignments != null) {
            response.setAssignments(assignments.stream().map(this::toAssignmentInfo).collect(Collectors.toList()));
        } else {
            response.setAssignments(Collections.emptyList());
        }
        return response;
    }

    private TestAssignmentInfo toAssignmentInfo(TestAssignment assignment) {
        TestAssignmentInfo info = new TestAssignmentInfo();
        info.setId(assignment.getId());
        info.setClassName(assignment.getClassName());
        info.setDueDate(assignment.getDueDate());
        info.setAssignedAt(assignment.getAssignedAt());
        return info;
    }

    private TestSubmissionResponse toSubmissionResponse(TestSubmission submission) {
        TestSubmissionResponse response = new TestSubmissionResponse();
        response.setId(submission.getId());
        response.setTestId(submission.getTestId());
        response.setStudentName(nameLookupService.studentName(submission.getStudentEgn()));
        response.setAnswersJson(submission.getAnswersJson());
        response.setSubmittedAt(submission.getSubmittedAt());
        response.setStatus(submission.getStatus());
        response.setScore(submission.getScore());
        response.setFeedback(submission.getFeedback());
        response.setGradedAt(submission.getGradedAt());
        return response;
    }
}
