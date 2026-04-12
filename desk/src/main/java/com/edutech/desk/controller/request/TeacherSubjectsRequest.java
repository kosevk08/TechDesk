package com.edutech.desk.controller.request;

import java.util.List;

public class TeacherSubjectsRequest {
    private String teacherEgn;
    private List<String> subjects;

    public String getTeacherEgn() { return teacherEgn; }
    public void setTeacherEgn(String teacherEgn) { this.teacherEgn = teacherEgn; }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }
}
