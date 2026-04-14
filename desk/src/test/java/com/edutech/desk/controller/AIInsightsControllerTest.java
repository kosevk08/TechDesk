package com.edutech.desk.controller;

import com.edutech.desk.entities.AiTaskData;
import com.edutech.desk.entities.Attendance;
import com.edutech.desk.entities.Student;
import com.edutech.desk.repository.AttendanceRepository;
import com.edutech.desk.repository.AiTaskDataRepository;
import com.edutech.desk.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:techdesk;DB_CLOSE_DELAY=-1;MODE=MYSQL",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.sql.init.mode=never"
})
class AIInsightsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AiTaskDataRepository aiTaskDataRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @BeforeEach
    void setUp() {
        aiTaskDataRepository.deleteAll();
        attendanceRepository.deleteAll();
        studentRepository.deleteAll();

        Student student = new Student();
        student.setEgn("1000000001");
        student.setFirstName("Victor");
        student.setLastName("Kolev");
        student.setEmail("victor@example.com");
        student.setGrade("11");
        student.setClassName("11D");
        studentRepository.save(student);

        aiTaskDataRepository.save(task("1000000001", "math-task-1", "Maths", "Linear equations", 900L, 4, false, 2, true));
        aiTaskDataRepository.save(task("1000000001", "math-task-2", "Maths", "Linear equations", 780L, 3, true, 1, false));
        aiTaskDataRepository.save(task("1000000001", "physics-task-1", "Physics", "Forces", 300L, 1, true, 0, false));
        attendanceRepository.save(attendance("1000000001", "PRESENT"));
        attendanceRepository.save(attendance("1000000001", "ABSENT"));
    }

    @Test
    void shouldReturnTeacherDashboardInsights() throws Exception {
        mockMvc.perform(get("/api/ai/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overview.totalTasks").value(3))
                .andExpect(jsonPath("$.overview.strugglingStudentsCount").value(1))
                .andExpect(jsonPath("$.strugglingStudents[0].studentName").value("Victor Kolev"))
                .andExpect(jsonPath("$.topicInsights[0].label").exists())
                .andExpect(jsonPath("$.alerts").isArray());
    }

    @Test
    void shouldReturnGuidedSupportWithoutAnswers() throws Exception {
        String payload = """
                {
                  "studentId": "1000000001",
                  "subject": "Maths",
                  "concept": "Linear equations",
                  "taskId": "math-task-1",
                  "timeSpent": 840,
                  "attempts": 4,
                  "correct": false,
                  "corrections": 2,
                  "skipped": false
                }
                """;

        mockMvc.perform(post("/api/ai/guidance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guidanceLevel").value("HIGH"))
                .andExpect(jsonPath("$.hints[0]").exists())
                .andExpect(jsonPath("$.guidingQuestions[0]").exists())
                .andExpect(jsonPath("$.teacherEscalation").exists());
    }

    @Test
    void shouldReturnParentProgressInsights() throws Exception {
        mockMvc.perform(get("/api/ai/parent/1000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName").value("Victor Kolev"))
                .andExpect(jsonPath("$.weakSubjects").isArray())
                .andExpect(jsonPath("$.parentActions[0]").exists())
                .andExpect(jsonPath("$.attendance.totalRecords").value(2));
    }

    @Test
    void shouldReturnEmptyTeacherDashboardWhenNoTrackedDataExists() throws Exception {
        aiTaskDataRepository.deleteAll();
        attendanceRepository.deleteAll();
        studentRepository.deleteAll();

        mockMvc.perform(get("/api/ai/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overview.totalTasks").value(0))
                .andExpect(jsonPath("$.overview.strugglingStudentsCount").value(0))
                .andExpect(jsonPath("$.strugglingStudents").isEmpty())
                .andExpect(jsonPath("$.topicInsights").isEmpty())
                .andExpect(jsonPath("$.alerts").isEmpty());
    }

    @Test
    void shouldReturnParentDefaultsWhenStudentHasNoAiActivity() throws Exception {
        aiTaskDataRepository.deleteAll();
        attendanceRepository.deleteAll();

        mockMvc.perform(get("/api/ai/parent/1000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName").value("Victor Kolev"))
                .andExpect(jsonPath("$.accuracyRate").value(0.0))
                .andExpect(jsonPath("$.progressTrend").value("BUILDING_BASELINE"))
                .andExpect(jsonPath("$.engagementLevel").value("NO_ACTIVITY_YET"));
    }

    @Test
    void shouldRejectInvalidGuidancePayload() throws Exception {
        String payload = """
                {
                  "studentId": "",
                  "taskId": "",
                  "timeSpent": -1,
                  "attempts": -3,
                  "correct": null
                }
                """;

        mockMvc.perform(post("/api/ai/guidance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("bad_request"))
                .andExpect(jsonPath("$.errors.studentId").exists())
                .andExpect(jsonPath("$.errors.taskId").exists())
                .andExpect(jsonPath("$.errors.timeSpent").exists())
                .andExpect(jsonPath("$.errors.attempts").exists())
                .andExpect(jsonPath("$.errors.correct").exists());
    }

    @Test
    void shouldReturnMediumGuidanceAtConfiguredThresholds() throws Exception {
        String payload = """
                {
                  "studentId": "1000000001",
                  "subject": "Maths",
                  "concept": "Fractions",
                  "taskId": "math-task-3",
                  "timeSpent": 420,
                  "attempts": 3,
                  "correct": true,
                  "corrections": 0,
                  "skipped": false
                }
                """;

        mockMvc.perform(post("/api/ai/guidance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guidanceLevel").value("MEDIUM"));
    }

    private AiTaskData task(String studentId, String taskId, String subject, String concept, long timeSpent,
                            int attempts, boolean correct, int corrections, boolean skipped) {
        AiTaskData task = new AiTaskData();
        task.setStudentId(studentId);
        task.setTaskId(taskId);
        task.setSubject(subject);
        task.setConcept(concept);
        task.setTimeSpent(timeSpent);
        task.setAttempts(attempts);
        task.setCorrect(correct);
        task.setCorrections(corrections);
        task.setCompleted(!skipped);
        task.setSkipped(skipped);
        return task;
    }

    private Attendance attendance(String studentEgn, String status) {
        Attendance attendance = new Attendance();
        attendance.setStudentEgn(studentEgn);
        attendance.setStatus(status);
        attendance.setDate(java.time.LocalDate.now());
        return attendance;
    }
}
