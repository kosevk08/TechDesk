package com.edutech.desk.controller;

import com.edutech.desk.controller.response.AttendanceResponse;
import com.edutech.desk.entities.Attendance;
import com.edutech.desk.service.CurrentUserService;
import com.edutech.desk.service.NameLookupService;
import com.edutech.desk.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private NameLookupService nameLookupService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<AttendanceResponse>> getByStudent(@PathVariable String egn) {
        List<AttendanceResponse> responses = attendanceService.getByStudentEgn(egn)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceResponse>> getByDate(@PathVariable String date) {
        List<AttendanceResponse> responses = attendanceService.getByDate(LocalDate.parse(date))
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance() {
        String egn = currentUserService.getEgn();
        if (egn == null) return ResponseEntity.ok(List.of());
        List<AttendanceResponse> responses = attendanceService.getByStudentEgn(egn)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/child")
    public ResponseEntity<List<AttendanceResponse>> getChildAttendance() {
        var user = currentUserService.getUser();
        if (user == null || user.getStudentEgn() == null) return ResponseEntity.ok(List.of());
        List<AttendanceResponse> responses = attendanceService.getByStudentEgn(user.getStudentEgn())
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/mark")
    public ResponseEntity<AttendanceResponse> markAttendance(@RequestBody Map<String, String> body) {
        String studentName = body.get("studentName");
        String studentEgn = body.get("studentEgn");
        if (studentEgn == null && studentName != null) {
            studentEgn = nameLookupService.studentEgnByName(studentName);
        }
        LocalDate date = LocalDate.parse(body.get("date"));
        String status = body.get("status");
        String period = body.getOrDefault("period", "ALL_DAY");
        Attendance saved = attendanceService.markAttendance(studentEgn, date, status, period);
        return ResponseEntity.ok(toResponse(saved));
    }

    private AttendanceResponse toResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setStudentName(nameLookupService.studentName(attendance.getStudentEgn()));
        response.setDate(attendance.getDate());
        response.setStatus(attendance.getStatus());
        response.setPeriod(attendance.getPeriod());
        return response;
    }
}
