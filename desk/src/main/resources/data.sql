MERGE INTO subjects (name, description) KEY(name) VALUES
('Bulgarian Language and Literature', 'Bulgarian language and literature studies'),
('English', 'English language studies'),
('Chemistry', 'Chemistry studies'),
('Physics', 'Physics studies'),
('Maths', 'Mathematics studies'),
('Biology', 'Biology studies'),
('Social Anthropology', 'Social anthropology studies'),
('Geography', 'Geography studies'),
('English Literature', 'English literature studies'),
('German (A1)', 'German language for beginners'),
('Spanish (A1)', 'Spanish language for beginners'),
('Philosophy', 'Philosophy studies');

MERGE INTO users (egn, email, password, role, demo, student_egn) KEY(egn) VALUES
('1000000001', 'v.kolev-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000002', 'k.kosev-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000003', 'i.ivanov-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000004', 'j.doe-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000005', 'd.kovacs-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000006', 's.martinez-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000007', 'm.bennett-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000008', 'e.petrova-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000009', 'l.oconnor-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000010', 'v.ivanov-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000011', 'n.fischer-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('1000000012', 'c.mendes-student@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'STUDENT', FALSE, NULL),
('2000000001', 'h.schmidt-teacher@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000002', 'a.popescu-teacher@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000003', 'm.ivanova-maths@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000004', 'p.georgiev-physics@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000005', 'l.stoyanova-chem@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000006', 'd.petrov-biology@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000007', 's.martin-english@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000008', 't.vasileva-bulgarian@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000009', 'g.stefanov-geography@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000010', 'r.dimitrova-philosophy@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000011', 'n.koleva-englishlit@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000012', 'v.georgieva-german@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000013', 'i.karaslavova-spanish@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('2000000014', 'e.nikolova-anthro@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'TEACHER', FALSE, NULL),
('3000000001', 'l.navarro-parent@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'PARENT', FALSE, '1000000002'),
('4000000001', 'admin@edu-school.bg', '$2a$10$Xwuz72m4OxyhXYTlYjgtg.yDSxIj0RRlPkKzCSnoP0yw40ytzmudG', 'ADMIN', FALSE, NULL),
('9000000001', 'r.paskalev-student@edu-school.bg', '$2y$10$JrrkR8J67vRLI4Sl7nMsFufdGpfvRZWI1Nx4w851qPJ13cHphZpY2', 'STUDENT', TRUE, NULL),
('9000000002', 'e.vasileva-teacher@edu-school.bg', '$2y$10$JrrkR8J67vRLI4Sl7nMsFufdGpfvRZWI1Nx4w851qPJ13cHphZpY2', 'TEACHER', TRUE, NULL),
('9000000003', 'p.stoyanov-parent@edu-school.bg', '$2y$10$JrrkR8J67vRLI4Sl7nMsFufdGpfvRZWI1Nx4w851qPJ13cHphZpY2', 'PARENT', TRUE, '9000000001'),
('9000000004', 's.markova-admin@edu-school.bg', '$2y$10$JrrkR8J67vRLI4Sl7nMsFufdGpfvRZWI1Nx4w851qPJ13cHphZpY2', 'ADMIN', TRUE, NULL);

MERGE INTO students (egn, first_name, last_name, email, grade, class_name) KEY(egn) VALUES
('1000000001', 'Victor', 'Kolev', 'v.kolev-student@edu-school.bg', '10', '10A'),
('1000000002', 'Konstantin', 'Kosev', 'k.kosev-student@edu-school.bg', '10', '10A'),
('1000000003', 'Ivan', 'Ivanov', 'i.ivanov-student@edu-school.bg', '10', '10A'),
('1000000004', 'John', 'Doe', 'j.doe-student@edu-school.bg', '10', '10B'),
('1000000005', 'Daniel', 'Kovacs', 'd.kovacs-student@edu-school.bg', '10', '10B'),
('1000000006', 'Sofia', 'Martinez', 's.martinez-student@edu-school.bg', '10', '10B'),
('1000000007', 'Marcus', 'Bennett', 'm.bennett-student@edu-school.bg', '11', '11A'),
('1000000008', 'Elena', 'Petrova', 'e.petrova-student@edu-school.bg', '11', '11A'),
('1000000009', 'Liam', 'OConnor', 'l.oconnor-student@edu-school.bg', '11', '11A'),
('1000000010', 'Victor', 'Ivanov', 'v.ivanov-student@edu-school.bg', '11', '11B'),
('1000000011', 'Natalie', 'Fischer', 'n.fischer-student@edu-school.bg', '11', '11B'),
('1000000012', 'Carlos', 'Mendes', 'c.mendes-student@edu-school.bg', '11', '11B');

MERGE INTO teachers (egn, first_name, last_name, email) KEY(egn) VALUES
('2000000001', 'Helena', 'Schmidt', 'h.schmidt-teacher@edu-school.bg'),
('2000000002', 'Andrei', 'Popescu', 'a.popescu-teacher@edu-school.bg'),
('2000000003', 'Maya', 'Ivanova', 'm.ivanova-maths@edu-school.bg'),
('2000000004', 'Petar', 'Georgiev', 'p.georgiev-physics@edu-school.bg'),
('2000000005', 'Lora', 'Stoyanova', 'l.stoyanova-chem@edu-school.bg'),
('2000000006', 'Dimitar', 'Petrov', 'd.petrov-biology@edu-school.bg'),
('2000000007', 'Simeon', 'Martin', 's.martin-english@edu-school.bg'),
('2000000008', 'Tanya', 'Vasileva', 't.vasileva-bulgarian@edu-school.bg'),
('2000000009', 'Georgi', 'Stefanov', 'g.stefanov-geography@edu-school.bg'),
('2000000010', 'Rada', 'Dimitrova', 'r.dimitrova-philosophy@edu-school.bg'),
('2000000011', 'Nina', 'Koleva', 'n.koleva-englishlit@edu-school.bg'),
('2000000012', 'Violeta', 'Georgieva', 'v.georgieva-german@edu-school.bg'),
('2000000013', 'Ivana', 'Karaslavova', 'i.karaslavova-spanish@edu-school.bg'),
('2000000014', 'Elena', 'Nikolova', 'e.nikolova-anthro@edu-school.bg');

MERGE INTO teacher_subjects (teacher_egn, subject) KEY(teacher_egn, subject) VALUES
('2000000003', 'Maths'),
('2000000004', 'Physics'),
('2000000005', 'Chemistry'),
('2000000006', 'Biology'),
('2000000007', 'English'),
('2000000008', 'Bulgarian Language and Literature'),
('2000000009', 'Geography'),
('2000000010', 'Philosophy'),
('2000000011', 'English Literature'),
('2000000012', 'German (A1)'),
('2000000013', 'Spanish (A1)'),
('2000000014', 'Social Anthropology');

MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000003', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Maths';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000004', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Physics';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000005', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Chemistry';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000006', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Biology';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000007', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'English';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000008', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Bulgarian Language and Literature';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000009', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Geography';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000010', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Philosophy';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000011', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'English Literature';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000012', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'German (A1)';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000013', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Spanish (A1)';
MERGE INTO lessons (subject_id, teacher_egn, date, content) KEY(subject_id, teacher_egn)
SELECT s.id, '2000000014', DATE '2026-04-01', 'Lead teacher' FROM subjects s WHERE s.name = 'Social Anthropology';

MERGE INTO notebooks (student_egn, subject, school_year, format, style, color, content, page_number) KEY(student_egn, subject, school_year, page_number) VALUES
('1000000001', 'Maths', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000001', 'Physics', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000001', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000001', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000001', 'English Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000001', 'German (A1)', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000002', 'Maths', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000002', 'Physics', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000002', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000002', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000002', 'English Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000002', 'German (A1)', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000003', 'Maths', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000003', 'Physics', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000003', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000003', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000003', 'English Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000003', 'German (A1)', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000004', 'Biology', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000004', 'Chemistry', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000004', 'Physics', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000004', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000004', 'English Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000004', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000005', 'Biology', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000005', 'Chemistry', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000005', 'Physics', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000005', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000005', 'English Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000005', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000006', 'Biology', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000006', 'Chemistry', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000006', 'Physics', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000006', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000006', 'English Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000006', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000007', 'Biology', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000007', 'Chemistry', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000007', 'Physics', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000007', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000007', 'English Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000007', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000008', 'Geography', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000008', 'Social Anthropology', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000008', 'Philosophy', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000008', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000008', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000009', 'Geography', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000009', 'Philosophy', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000009', 'Spanish (A1)', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000009', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000009', 'Maths', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000010', 'Social Anthropology', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000010', 'Geography', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000010', 'Philosophy', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000010', 'Spanish (A1)', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000010', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000011', 'Chemistry', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000011', 'Geography', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000011', 'German (A1)', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000011', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000011', 'Bulgarian Language and Literature', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000012', 'Social Anthropology', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000012', 'Philosophy', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000012', 'Spanish (A1)', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000012', 'Maths', '2025-2026', 'A4', 'lined', 'blue', '', 1),
('1000000012', 'English', '2025-2026', 'A4', 'lined', 'blue', '', 1);
