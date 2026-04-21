package com.edutech.desk.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_reward_state")
public class StudentRewardState {

    @Id
    @Column(nullable = false, unique = true)
    private String studentEgn;

    @Column(nullable = false)
    private int xp = 0;

    @Column(nullable = false)
    private int streak = 1;

    @Column(nullable = false)
    private int testsSubmitted = 0;

    @Column(nullable = false)
    private int practiceRounds = 0;

    @Column(columnDefinition = "LONGTEXT")
    private String badgesJson;

    @Column(columnDefinition = "LONGTEXT")
    private String rewardedTestIdsJson;

    @Column
    private LocalDateTime updatedAt;

    public String getStudentEgn() { return studentEgn; }
    public void setStudentEgn(String studentEgn) { this.studentEgn = studentEgn; }
    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }
    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }
    public int getTestsSubmitted() { return testsSubmitted; }
    public void setTestsSubmitted(int testsSubmitted) { this.testsSubmitted = testsSubmitted; }
    public int getPracticeRounds() { return practiceRounds; }
    public void setPracticeRounds(int practiceRounds) { this.practiceRounds = practiceRounds; }
    public String getBadgesJson() { return badgesJson; }
    public void setBadgesJson(String badgesJson) { this.badgesJson = badgesJson; }
    public String getRewardedTestIdsJson() { return rewardedTestIdsJson; }
    public void setRewardedTestIdsJson(String rewardedTestIdsJson) { this.rewardedTestIdsJson = rewardedTestIdsJson; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
