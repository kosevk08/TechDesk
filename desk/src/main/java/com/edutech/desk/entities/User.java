package com.edutech.desk.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "egn", nullable = false, unique = true)
    private String egn;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean demo = false;

    @Column
    private String studentEgn;

    @Column
    private String displayName;

    public User() {}

    public String getEgn() { return egn; }
    public void setEgn(String egn) { this.egn = egn; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isDemo() { return demo; }
    public void setDemo(boolean demo) { this.demo = demo; }
    public String getStudentEgn() { return studentEgn; }
    public void setStudentEgn(String studentEgn) { this.studentEgn = studentEgn; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}