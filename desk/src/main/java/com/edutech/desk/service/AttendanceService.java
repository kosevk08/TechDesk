package com.edutech.desk.service;

import com.edutech.desk.entities.Attendance;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    List<Attendance> getByStudentEgn(String studentEgn);
    List<Attendance> getByDate(LocalDate date);
    Attendance markAttendance(String studentEgn, LocalDate date, String status, String period);
}
