package com.edutech.desk.controller;

import com.edutech.desk.entities.Attendance;
import com.edutech.desk.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/student/{egn}")
    public ResponseEntity<List<Attendance>> getByStudent(@PathVariable String egn) {
        return ResponseEntity.ok(attendanceService.getByStudentEgn(egn));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Attendance>> getByDate(@PathVariable String date) {
        return ResponseEntity.ok(attendanceService.getByDate(LocalDate.parse(date)));
    }

    @PostMapping("/mark")
    public ResponseEntity<Attendance> markAttendance(@RequestBody Map<String, String> body) {
        String studentEgn = body.get("studentEgn");
        LocalDate date = LocalDate.parse(body.get("date"));
        String status = body.get("status");
        return ResponseEntity.ok(attendanceService.markAttendance(studentEgn, date, status));
    }
}