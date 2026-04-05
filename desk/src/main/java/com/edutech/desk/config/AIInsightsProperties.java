package com.edutech.desk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "techdesk.ai")
public class AIInsightsProperties {

    private final Risk risk = new Risk();
    private final Difficulty difficulty = new Difficulty();
    private final Guidance guidance = new Guidance();

    public Risk getRisk() {
        return risk;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public Guidance getGuidance() {
        return guidance;
    }

    public static class Risk {
        private double highAccuracyBelow = 45;
        private double mediumAccuracyBelow = 70;
        private double highAttemptsAtLeast = 3.5;
        private double mediumAttemptsAtLeast = 2.5;
        private double highTimeSecondsAtLeast = 720;
        private double mediumTimeSecondsAtLeast = 420;
        private long highSkippedAtLeast = 2;
        private long mediumSkippedAtLeast = 1;
        private double increaseDifficultyAccuracyAtLeast = 85;
        private double increaseDifficultyAttemptsAtMost = 1.5;

        public double getHighAccuracyBelow() {
            return highAccuracyBelow;
        }

        public void setHighAccuracyBelow(double highAccuracyBelow) {
            this.highAccuracyBelow = highAccuracyBelow;
        }

        public double getMediumAccuracyBelow() {
            return mediumAccuracyBelow;
        }

        public void setMediumAccuracyBelow(double mediumAccuracyBelow) {
            this.mediumAccuracyBelow = mediumAccuracyBelow;
        }

        public double getHighAttemptsAtLeast() {
            return highAttemptsAtLeast;
        }

        public void setHighAttemptsAtLeast(double highAttemptsAtLeast) {
            this.highAttemptsAtLeast = highAttemptsAtLeast;
        }

        public double getMediumAttemptsAtLeast() {
            return mediumAttemptsAtLeast;
        }

        public void setMediumAttemptsAtLeast(double mediumAttemptsAtLeast) {
            this.mediumAttemptsAtLeast = mediumAttemptsAtLeast;
        }

        public double getHighTimeSecondsAtLeast() {
            return highTimeSecondsAtLeast;
        }

        public void setHighTimeSecondsAtLeast(double highTimeSecondsAtLeast) {
            this.highTimeSecondsAtLeast = highTimeSecondsAtLeast;
        }

        public double getMediumTimeSecondsAtLeast() {
            return mediumTimeSecondsAtLeast;
        }

        public void setMediumTimeSecondsAtLeast(double mediumTimeSecondsAtLeast) {
            this.mediumTimeSecondsAtLeast = mediumTimeSecondsAtLeast;
        }

        public long getHighSkippedAtLeast() {
            return highSkippedAtLeast;
        }

        public void setHighSkippedAtLeast(long highSkippedAtLeast) {
            this.highSkippedAtLeast = highSkippedAtLeast;
        }

        public long getMediumSkippedAtLeast() {
            return mediumSkippedAtLeast;
        }

        public void setMediumSkippedAtLeast(long mediumSkippedAtLeast) {
            this.mediumSkippedAtLeast = mediumSkippedAtLeast;
        }

        public double getIncreaseDifficultyAccuracyAtLeast() {
            return increaseDifficultyAccuracyAtLeast;
        }

        public void setIncreaseDifficultyAccuracyAtLeast(double increaseDifficultyAccuracyAtLeast) {
            this.increaseDifficultyAccuracyAtLeast = increaseDifficultyAccuracyAtLeast;
        }

        public double getIncreaseDifficultyAttemptsAtMost() {
            return increaseDifficultyAttemptsAtMost;
        }

        public void setIncreaseDifficultyAttemptsAtMost(double increaseDifficultyAttemptsAtMost) {
            this.increaseDifficultyAttemptsAtMost = increaseDifficultyAttemptsAtMost;
        }
    }

    public static class Difficulty {
        private double mediumTimeSecondsAtLeast = 480;
        private double difficultTimeSecondsAtLeast = 780;
        private double mediumAttemptsAtLeast = 2.5;
        private double difficultAttemptsAtLeast = 3.5;
        private double mediumAccuracyBelow = 70;
        private double difficultAccuracyBelow = 45;
        private int mediumScoreAtLeast = 2;
        private int difficultScoreAtLeast = 5;

        public double getMediumTimeSecondsAtLeast() {
            return mediumTimeSecondsAtLeast;
        }

        public void setMediumTimeSecondsAtLeast(double mediumTimeSecondsAtLeast) {
            this.mediumTimeSecondsAtLeast = mediumTimeSecondsAtLeast;
        }

        public double getDifficultTimeSecondsAtLeast() {
            return difficultTimeSecondsAtLeast;
        }

        public void setDifficultTimeSecondsAtLeast(double difficultTimeSecondsAtLeast) {
            this.difficultTimeSecondsAtLeast = difficultTimeSecondsAtLeast;
        }

        public double getMediumAttemptsAtLeast() {
            return mediumAttemptsAtLeast;
        }

        public void setMediumAttemptsAtLeast(double mediumAttemptsAtLeast) {
            this.mediumAttemptsAtLeast = mediumAttemptsAtLeast;
        }

        public double getDifficultAttemptsAtLeast() {
            return difficultAttemptsAtLeast;
        }

        public void setDifficultAttemptsAtLeast(double difficultAttemptsAtLeast) {
            this.difficultAttemptsAtLeast = difficultAttemptsAtLeast;
        }

        public double getMediumAccuracyBelow() {
            return mediumAccuracyBelow;
        }

        public void setMediumAccuracyBelow(double mediumAccuracyBelow) {
            this.mediumAccuracyBelow = mediumAccuracyBelow;
        }

        public double getDifficultAccuracyBelow() {
            return difficultAccuracyBelow;
        }

        public void setDifficultAccuracyBelow(double difficultAccuracyBelow) {
            this.difficultAccuracyBelow = difficultAccuracyBelow;
        }

        public int getMediumScoreAtLeast() {
            return mediumScoreAtLeast;
        }

        public void setMediumScoreAtLeast(int mediumScoreAtLeast) {
            this.mediumScoreAtLeast = mediumScoreAtLeast;
        }

        public int getDifficultScoreAtLeast() {
            return difficultScoreAtLeast;
        }

        public void setDifficultScoreAtLeast(int difficultScoreAtLeast) {
            this.difficultScoreAtLeast = difficultScoreAtLeast;
        }
    }

    public static class Guidance {
        private long mediumTimeSecondsAtLeast = 420;
        private int mediumAttemptsAtLeast = 3;
        private int highAttemptsAtLeast = 5;
        private int correctionPressureAtLeast = 2;
        private int mediumScoreAtMost = 1;
        private int highScoreAtMost = 3;

        public long getMediumTimeSecondsAtLeast() {
            return mediumTimeSecondsAtLeast;
        }

        public void setMediumTimeSecondsAtLeast(long mediumTimeSecondsAtLeast) {
            this.mediumTimeSecondsAtLeast = mediumTimeSecondsAtLeast;
        }

        public int getMediumAttemptsAtLeast() {
            return mediumAttemptsAtLeast;
        }

        public void setMediumAttemptsAtLeast(int mediumAttemptsAtLeast) {
            this.mediumAttemptsAtLeast = mediumAttemptsAtLeast;
        }

        public int getHighAttemptsAtLeast() {
            return highAttemptsAtLeast;
        }

        public void setHighAttemptsAtLeast(int highAttemptsAtLeast) {
            this.highAttemptsAtLeast = highAttemptsAtLeast;
        }

        public int getCorrectionPressureAtLeast() {
            return correctionPressureAtLeast;
        }

        public void setCorrectionPressureAtLeast(int correctionPressureAtLeast) {
            this.correctionPressureAtLeast = correctionPressureAtLeast;
        }

        public int getMediumScoreAtMost() {
            return mediumScoreAtMost;
        }

        public void setMediumScoreAtMost(int mediumScoreAtMost) {
            this.mediumScoreAtMost = mediumScoreAtMost;
        }

        public int getHighScoreAtMost() {
            return highScoreAtMost;
        }

        public void setHighScoreAtMost(int highScoreAtMost) {
            this.highScoreAtMost = highScoreAtMost;
        }
    }
}
