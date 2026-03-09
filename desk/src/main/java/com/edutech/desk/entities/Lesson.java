package com.edutech.desk.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String teacherEgn;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String grade;

    private String className;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private boolean isLive;

    @Column(columnDefinition = "TEXT")
    private String presentationUrl;

    @Column(columnDefinition = "TEXT")
    private String textbookUrl;

    @ElementCollection
    private List<String> studentEgns;

    public Lesson() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTeacherEgn() { return teacherEgn; }
    public void setTeacherEgn(String teacherEgn) { this.teacherEgn = teacherEgn; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public boolean isLive() { return isLive; }
    public void setLive(boolean live) { isLive = live; }
    public String getPresentationUrl() { return presentationUrl; }
    public void setPresentationUrl(String presentationUrl) { this.presentationUrl = presentationUrl; }
    public String getTextbookUrl() { return textbookUrl; }
    public void setTextbookUrl(String textbookUrl) { this.textbookUrl = textbookUrl; }
    public List<String> getStudentEgns() { return studentEgns; }
    public void setStudentEgns(List<String> studentEgns) { this.studentEgns = studentEgns; }
}