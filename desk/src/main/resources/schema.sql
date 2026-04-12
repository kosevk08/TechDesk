CREATE TABLE IF NOT EXISTS users (
    egn VARCHAR(20) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    demo BOOLEAN DEFAULT FALSE,
    student_egn VARCHAR(20)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS demo BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_egn VARCHAR(20) NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS notebooks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_egn VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    school_year VARCHAR(20) NOT NULL,
    format VARCHAR(10) NOT NULL,
    style VARCHAR(20) NOT NULL,
    color VARCHAR(20) NOT NULL,
    content LONGTEXT,
    page_number INT DEFAULT 1,
    last_updated TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    egn VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    grade VARCHAR(20) NOT NULL,
    class_name VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS teachers (
    egn VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100)
);

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email VARCHAR(100);

CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_egn VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS parents (
    egn VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_egn VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_egn VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_value DECIMAL(4,2) NOT NULL,
    teacher_egn VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_egn VARCHAR(20) NOT NULL,
    type VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_egn VARCHAR(20) NOT NULL,
    receiver_egn VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant1_egn VARCHAR(20) NOT NULL,
    participant2_egn VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT,
    teacher_egn VARCHAR(20),
    date DATE,
    content TEXT
);

CREATE TABLE IF NOT EXISTS ai_task_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(100) NOT NULL,
    subject_name VARCHAR(255) NULL,
    concept_name VARCHAR(255) NULL,
    class_name VARCHAR(50) NULL,
    notebook_subject VARCHAR(255) NULL,
    notebook_page INT NULL,
    time_spent_seconds BIGINT NOT NULL,
    attempts INT NOT NULL,
    correct BOOLEAN NOT NULL,
    corrections INT NULL,
    completed BOOLEAN NULL,
    skipped BOOLEAN NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(100),
    description TEXT,
    questions_json LONGTEXT,
    total_points INT DEFAULT 0,
    created_by_egn VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id BIGINT NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    due_date DATE,
    assigned_by_egn VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id BIGINT NOT NULL,
    student_egn VARCHAR(20) NOT NULL,
    answers_json LONGTEXT,
    submitted_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SUBMITTED',
    score INT,
    feedback TEXT,
    graded_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    page VARCHAR(255),
    severity VARCHAR(20),
    contact VARCHAR(120),
    user_egn VARCHAR(20),
    user_display_name VARCHAR(120),
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
