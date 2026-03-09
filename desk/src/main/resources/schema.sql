CREATE TABLE IF NOT EXISTS users (
    egn VARCHAR(20) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    student_egn VARCHAR(20)
);

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
    last_updated DATETIME
);

CREATE TABLE IF NOT EXISTS students (
    egn VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    class_name VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS teachers (
    egn VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
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

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_egn VARCHAR(20) NOT NULL,
    receiver_egn VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME
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