package com.edutech.desk.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentEgn;

    @Column(nullable = false)
    private String subject;

    @Column(name = "grade_value", nullable = false)
    private Double value;

    @Column(nullable = false)
    private String teacherEgn;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Grade() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentEgn() { return studentEgn; }
    public void setStudentEgn(String studentEgn) { this.studentEgn = studentEgn; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
    public String getTeacherEgn() { return teacherEgn; }
    public void setTeacherEgn(String teacherEgn) { this.teacherEgn = teacherEgn; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
