package com.edutech.desk.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notebooks")
public class Notebook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentEgn;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String schoolYear;

    @Column(nullable = false)
    private String format;

    @Column(nullable = false)
    private String style;

    @Column(nullable = false)
    private String color;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 1")
    private int pageNumber = 1;

    private LocalDateTime lastUpdated;

    public Notebook() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentEgn() { return studentEgn; }
    public void setStudentEgn(String studentEgn) { this.studentEgn = studentEgn; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getSchoolYear() { return schoolYear; }
    public void setSchoolYear(String schoolYear) { this.schoolYear = schoolYear; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}