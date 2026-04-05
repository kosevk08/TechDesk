package com.edutech.desk.serviceimpl;

import com.edutech.desk.entities.Attendance;
import com.edutech.desk.repository.AttendanceRepository;
import com.edutech.desk.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private com.edutech.desk.service.NotificationService notificationService;

    @Autowired
    private com.edutech.desk.repository.UserRepository userRepository;

    @Override
    public List<Attendance> getByStudentEgn(String studentEgn) {
        return attendanceRepository.findByStudentEgn(studentEgn);
    }

    @Override
    public List<Attendance> getByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    @Override
    public Attendance markAttendance(String studentEgn, LocalDate date, String status) {
        Optional<Attendance> existing = attendanceRepository.findByStudentEgnAndDate(studentEgn, date);
        Attendance attendance = existing.orElse(new Attendance());
        attendance.setStudentEgn(studentEgn);
        attendance.setDate(date);
        attendance.setStatus(status);
        Attendance saved = attendanceRepository.save(attendance);

        String message = "Attendance update: " + status + " on " + date;
        notificationService.create(studentEgn, "ATTENDANCE", message);
        com.edutech.desk.entities.User parent = userRepository.findByStudentEgn(studentEgn);
        if (parent != null) {
            notificationService.create(parent.getEgn(), "ATTENDANCE",
                "Your child has " + status + " on " + date);
        }

        return saved;
    }
}
