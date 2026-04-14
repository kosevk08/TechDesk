package com.edutech.desk.controller;

import com.edutech.desk.entities.AiTaskData;
import com.edutech.desk.repository.AiTaskDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;

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
class AITrackerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AiTaskDataRepository aiTaskDataRepository;

    @BeforeEach
    void clearRepository() {
        aiTaskDataRepository.deleteAll();
    }

    @Test
    void shouldAcceptAndPersistTaskData() throws Exception {
        String payload = "{\"studentId\":\"1000000001\",\"taskId\":\"task-123\",\"timeSpent\":50,\"attempts\":2,\"correct\":true,\"corrections\":1}";

        mockMvc.perform(post("/api/ai/task-data")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isAccepted());

        await()
                .atMost(Duration.ofSeconds(3))
                .untilAsserted(() -> assertThat(aiTaskDataRepository.count()).isEqualTo(1));

        AiTaskData saved = aiTaskDataRepository.findAll().getFirst();
        assertThat(saved.getStudentId()).isEqualTo("1000000001");
        assertThat(saved.getTaskId()).isEqualTo("task-123");
        assertThat(saved.getTimeSpent()).isEqualTo(50L);
        assertThat(saved.getAttempts()).isEqualTo(2);
        assertThat(saved.getCorrect()).isTrue();
        assertThat(saved.getCorrections()).isEqualTo(1);
    }

    @Test
    void shouldAcceptTaskDataWithoutOptionalCorrections() throws Exception {
        String payload = "{\"studentId\":\"1000000002\",\"taskId\":\"task-456\",\"timeSpent\":75,\"attempts\":1,\"correct\":false}";

        mockMvc.perform(post("/api/ai/task-data")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isAccepted());

        await()
                .atMost(Duration.ofSeconds(3))
                .untilAsserted(() -> assertThat(aiTaskDataRepository.count()).isEqualTo(1));

        AiTaskData saved = aiTaskDataRepository.findAll().getFirst();
        assertThat(saved.getStudentId()).isEqualTo("1000000002");
        assertThat(saved.getTaskId()).isEqualTo("task-456");
        assertThat(saved.getTimeSpent()).isEqualTo(75L);
        assertThat(saved.getAttempts()).isEqualTo(1);
        assertThat(saved.getCorrect()).isFalse();
        assertThat(saved.getCorrections()).isNull();
    }

    @Test
    void shouldRejectInvalidTaskData() throws Exception {
        String payload = "{\"studentId\":\"\",\"taskId\":\"task-789\",\"timeSpent\":-5,\"attempts\":1,\"correct\":true}";

        mockMvc.perform(post("/api/ai/task-data")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.status").value("bad_request"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.errors.studentId").exists())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.errors.timeSpent").exists());

        assertThat(aiTaskDataRepository.count()).isZero();
    }

    @Test
    void shouldRejectNegativeCorrections() throws Exception {
        String payload = "{\"studentId\":\"1000000001\",\"taskId\":\"task-999\",\"timeSpent\":12,\"attempts\":1,\"correct\":true,\"corrections\":-1}";

        mockMvc.perform(post("/api/ai/task-data")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.errors.corrections").exists());

        assertThat(aiTaskDataRepository.count()).isZero();
    }
}
