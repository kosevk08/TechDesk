package com.edutech.desk.serviceimpl;

import com.edutech.desk.controller.request.AiGuidanceRequest;
import com.edutech.desk.controller.response.AiGuidanceResponse;
import com.edutech.desk.controller.response.AiParentDashboardResponse;
import com.edutech.desk.controller.response.AiTeacherDashboardResponse;
import com.edutech.desk.entities.Attendance;
import com.edutech.desk.entities.AiTaskData;
import com.edutech.desk.entities.Student;
import com.edutech.desk.repository.AttendanceRepository;
import com.edutech.desk.repository.AiTaskDataRepository;
import com.edutech.desk.repository.StudentRepository;
import com.edutech.desk.service.AIInsightsService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.serviceimpl.ai.AiParentInsightsAssembler;
import com.edutech.desk.serviceimpl.ai.AiStudentGuidanceBuilder;
import com.edutech.desk.serviceimpl.ai.AiTeacherInsightsAssembler;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIInsightsServiceImpl implements AIInsightsService {

    private final AiTaskDataRepository aiTaskDataRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final AiTeacherInsightsAssembler teacherInsightsAssembler;
    private final AiParentInsightsAssembler parentInsightsAssembler;
    private final AiStudentGuidanceBuilder studentGuidanceBuilder;
    private final NameLookupService nameLookupService;

    public AIInsightsServiceImpl(AiTaskDataRepository aiTaskDataRepository,
                                 StudentRepository studentRepository,
                                 AttendanceRepository attendanceRepository,
                                 AiTeacherInsightsAssembler teacherInsightsAssembler,
                                 AiParentInsightsAssembler parentInsightsAssembler,
                                 AiStudentGuidanceBuilder studentGuidanceBuilder,
                                 NameLookupService nameLookupService) {
        this.aiTaskDataRepository = aiTaskDataRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.teacherInsightsAssembler = teacherInsightsAssembler;
        this.parentInsightsAssembler = parentInsightsAssembler;
        this.studentGuidanceBuilder = studentGuidanceBuilder;
        this.nameLookupService = nameLookupService;
    }

    @Override
    public AiTeacherDashboardResponse buildTeacherDashboard() {
        List<AiTaskData> tasks = aiTaskDataRepository.findAll();
        Map<String, Student> studentsById = studentRepository.findAll().stream()
                .collect(Collectors.toMap(Student::getEgn, student -> student, (a, b) -> a));
        studentRepository.findAll().forEach(student -> {
            studentsById.putIfAbsent(nameLookupService.studentName(student.getEgn()), student);
        });
        return teacherInsightsAssembler.build(tasks, studentsById);
    }

    @Override
    public AiParentDashboardResponse buildParentDashboard(String studentId) {
        String studentEgn = nameLookupService.studentEgnByName(studentId);
        if (studentEgn == null && studentRepository.findById(studentId).isPresent()) {
            studentEgn = studentId;
        }
        String studentKey = studentEgn != null ? nameLookupService.studentName(studentEgn) : studentId;
        List<AiTaskData> records = aiTaskDataRepository.findAll().stream()
                .filter(task -> studentKey.equals(task.getStudentId()))
                .toList();
        Student student = studentEgn != null ? studentRepository.findById(studentEgn).orElse(null) : null;
        List<Attendance> attendanceRecords = studentEgn != null ? attendanceRepository.findByStudentEgn(studentEgn) : List.of();
        return parentInsightsAssembler.build(studentKey, student, records, attendanceRecords);
    }

    @Override
    public AiGuidanceResponse buildStudentGuidance(AiGuidanceRequest request) {
        return studentGuidanceBuilder.build(request);
    }
}
