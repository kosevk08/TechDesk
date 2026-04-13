window.DemoData = {
    demoNotice: 'Demo mode: explore features safely. All actions stay inside demo data and never touch real accounts.',
    translations: {
        bg: {
            dashboard: 'Табло',
            notebooks: 'Тетрадки',
            grades: 'Оценки',
            attendance: 'Присъствие',
            ai_insights: 'AI Анализи',
            eli5_button: 'Обясни като на 5-годишен',
            heatmap: 'Топлинна карта на класа',
            voice_to_notes: 'Глас към записки',
            lesson_replay: 'Повторение на урока',
            attention_alert: 'Внимание: Студентът напусна прозореца'
            assistant_name: 'Теки'
        },
        sr: { dashboard: 'Контролна табла' }, // Serbian
        el: { dashboard: 'Πίνακας Ελέγχου' }, // Greek
        tr: { dashboard: 'Panel' },           // Turkish
        ro: { dashboard: 'Panou de control' }, // Romanian
        it: { dashboard: 'Cruscotto' },       // Italian
        es: { dashboard: 'Tablero' },          // Spanish
        fr: { dashboard: 'Tableau de bord' }   // French
    },
    student: {
        name: 'Radoslav Paskalev',
        className: '11D',
        email: 'r.paskalev-student@edu-school.bg',
        gamification: {
            points: 1250,
            level: 12,
            badges: ['Perfect Attendance', 'Math Whiz', 'Fast Responder'],
            nextLevelProgress: 75
        },
        status: 'online'
    },
    teacher: {
        name: 'Elena Vasileva',
        email: 'e.vasileva-teacher@edu-school.bg'
    },
    parent: {
        name: 'Plamen Stoyanov',
        email: 'p.stoyanov-parent@edu-school.bg',
        studentName: 'Radoslav Paskalev'
    },
    teachers: [
        { egn: '2000000003', firstName: 'Maya', lastName: 'Ivanova', email: 'm.ivanova-maths@edu-school.bg', subjects: ['Maths'] },
        { egn: '2000000004', firstName: 'Petar', lastName: 'Georgiev', email: 'p.georgiev-physics@edu-school.bg', subjects: ['Physics'] },
        { egn: '2000000007', firstName: 'Simeon', lastName: 'Martin', email: 's.martin-english@edu-school.bg', subjects: ['English'] }
    ],
    admin: {
        name: 'Sofia Markova',
        email: 's.markova-admin@edu-school.bg'
    },
    subjects: [
        { id: 1, name: 'Maths' },
        { id: 2, name: 'English' },
        { id: 3, name: 'Physics' },
        { id: 4, name: 'Biology' },
        { id: 5, name: 'Bulgarian Language and Literature' },
        { id: 6, name: 'History' }
    ],
    schedule: {
        week: {
            Monday: [
                { time: '08:00 - 08:45', subject: 'Maths', teacher: 'Ms Ivanova', room: '201' },
                { time: '08:55 - 09:40', subject: 'English', teacher: 'Mr Martin', room: '305' },
                { time: '09:50 - 10:35', subject: 'Physics', teacher: 'Mr Georgiev', room: 'Lab 2' }
            ],
            Tuesday: [
                { time: '08:00 - 08:45', subject: 'Biology', teacher: 'Mr Petrov', room: '203' },
                { time: '08:55 - 09:40', subject: 'History', teacher: 'Ms Dimitrova', room: '101' },
                { time: '09:50 - 10:35', subject: 'Maths', teacher: 'Ms Ivanova', room: '201' }
            ],
            Wednesday: [
                { time: '08:00 - 08:45', subject: 'Bulgarian Language and Literature', teacher: 'Ms Vasileva', room: '202' },
                { time: '08:55 - 09:40', subject: 'Physics', teacher: 'Mr Georgiev', room: 'Lab 2' }
            ]
        }
    },
    homework: [
        { subject: 'Maths', title: 'Quadratic Practice', dueDate: '2026-04-10', status: 'Assigned', details: 'Solve exercises 1-6, page 42.' },
        { subject: 'English', title: 'Reading Response', dueDate: '2026-04-11', status: 'In progress', details: 'Summarize chapter 3 in 150 words.' },
        { subject: 'Physics', title: 'Lab Notes', dueDate: '2026-04-12', status: 'Assigned', details: 'Upload the pendulum experiment notes.' }
    ],
    attendance: [
        { date: '2026-04-01', status: 'PRESENT' },
        { date: '2026-04-02', status: 'PRESENT' },
        { date: '2026-04-03', status: 'ABSENT_EXCUSED' },
        { date: '2026-04-04', status: 'LATE' }
    ],
    grades: [
        { subject: 'Maths', value: 5.75, comment: 'Great progress on algebra.', createdAt: '2026-04-02T09:10:00' },
        { subject: 'English', value: 5.25, comment: 'Strong vocabulary usage.', createdAt: '2026-03-28T11:30:00' },
        { subject: 'Physics', value: 5.50, comment: 'Accurate lab analysis.', createdAt: '2026-03-22T10:05:00' }
    ],
    averages: {
        Maths: 5.55,
        English: 5.25,
        Physics: 5.50
    },
    tests: [
        {
            testId: 101,
            title: 'Algebra Checkpoint',
            subject: 'Maths',
            dueDate: '2026-04-12',
            questionsJson: JSON.stringify([
                'Solve x^2 - 5x + 6 = 0.',
                'Factorize x^2 - 9.',
                'Find the vertex of y = x^2 + 4x + 1.'
            ]),
            status: 'ASSIGNED',
            score: null,
            feedback: null
        },
        {
            testId: 102,
            title: 'Physics Lab Safety',
            subject: 'Physics',
            dueDate: '2026-04-09',
            questionsJson: JSON.stringify([
                'List two safety rules for the lab.',
                'Explain why goggles are required.'
            ]),
            status: 'GRADED',
            score: 18,
            feedback: 'Clear answers, well done.'
        }
    ],
    teacherTests: [
        {
            id: 501,
            title: 'Algebra Checkpoint',
            subject: 'Maths',
            assignments: [{ className: '11D', dueDate: '2026-04-12' }]
        },
        {
            id: 502,
            title: 'Physics Lab Safety',
            subject: 'Physics',
            assignments: [{ className: '11D', dueDate: '2026-04-09' }]
        }
    ],
    testSubmissions: {
        501: [
            {
                id: 9001,
                answersJson: '{"answer":"x = -2 or x = 3"}',
                status: 'SUBMITTED',
                score: null,
                feedback: ''
            }
        ],
        502: [
            {
                id: 9002,
                answersJson: '{"answer":"Wear goggles and keep liquids away from outlets."}',
                status: 'GRADED',
                score: 18,
                feedback: 'Clear answers, good safety awareness.'
            }
        ]
    },
    notifications: [
        { type: 'Grade Update', message: 'Maths grade added: 5.75', createdAt: '2026-04-02 09:12' },
        { type: 'Attendance', message: 'Absence marked as excused on 2026-04-03.', createdAt: '2026-04-03 12:05' },
        { type: 'Test Assigned', message: 'Algebra Checkpoint due on 2026-04-12.', createdAt: '2026-04-04 08:15' }
    ],
    notebooks: [
        {
            studentName: 'Radoslav Paskalev',
            subject: 'Maths',
            page: 1,
            preview: 'Worked example: (x + 2)(x - 3) = 0 ➜ x = -2 or x = 3.',
            summary: 'Quadratic equations solved via factoring.'
        },
        {
            studentName: 'Radoslav Paskalev',
            subject: 'Physics',
            page: 1,
            preview: 'Lab notes: pendulum length vs period. Observed linear relationship.'
        }
    ],
    messages: {
        className: '11D',
        threads: [
            {
                otherName: 'Ms Vasileva',
                messages: [
                    { senderName: 'Ms Vasileva', content: 'Reminder: homework due Friday.', sentAt: '2026-04-03T09:15:00' },
                    { senderName: 'Radoslav Paskalev', content: 'Got it, thank you!', sentAt: '2026-04-03T09:18:00' }
                ]
            },
            {
                otherName: 'Mr Stoyanov',
                messages: [
                    { senderName: 'Mr Stoyanov', content: 'Please share the grade update.', sentAt: '2026-04-02T16:45:00' }
                ]
            }
        ],
        classMessages: [
            { senderName: 'Ms Vasileva', content: 'Class 11D: Quiz on Tuesday.', sentAt: '2026-04-04T08:00:00' }
        ],
        announcements: [
            { senderName: 'Ms Vasileva', content: 'School trip permission slips due Monday.', sentAt: '2026-04-01T12:30:00' }
        ]
    },
    feedback: [
        {
            id: 1,
            severity: 'Medium',
            page: 'Teacher • AI Insights',
            message: 'The AI dashboard loads slowly during peak hours.',
            createdAt: '2026-04-04T09:12:00',
            sender: 'Elena Vasileva'
        },
        {
            id: 2,
            severity: 'High',
            page: 'Student • Notebook',
            message: 'Live notebook sync stopped after switching tabs.',
            createdAt: '2026-04-05T14:05:00',
            sender: 'Radoslav Paskalev'
        }
    ],
    users: [
        { displayName: 'Radoslav Paskalev', role: 'STUDENT', email: 'r.paskalev-student@edu-school.bg' },
        { displayName: 'Elena Vasileva', role: 'TEACHER', email: 'e.vasileva-teacher@edu-school.bg' },
        { displayName: 'Plamen Stoyanov', role: 'PARENT', email: 'p.stoyanov-parent@edu-school.bg' },
        { displayName: 'Sofia Markova', role: 'ADMIN', email: 's.markova-admin@edu-school.bg' },
        { displayName: 'Victor Admin', role: 'ADMIN', email: 'victor-admin@techdesk.edu' }
    ],
    textbooks: {
        Maths: {
            title: 'Maths: Quadratic Foundations',
            sections: [
                { heading: 'Warm Up', body: 'Review factoring and square roots with short practice sets.' },
                { heading: 'Quadratic Formula', body: 'Use x = [-b ± √(b²-4ac)] / 2a to solve any quadratic equation.' },
                { heading: 'Graph Insight', body: 'Identify vertex and axis of symmetry to sketch parabolas quickly.' }
            ]
        },
        English: {
            title: 'English: Narrative Structure',
            sections: [
                { heading: 'Theme', body: 'Identify the driving message or lesson in each text.' },
                { heading: 'Character Arc', body: 'Track how the main character changes from beginning to end.' }
            ]
        },
        Physics: {
            title: 'Physics: Motion Lab',
            sections: [
                { heading: 'Key Formula', body: 'v = d / t. Compare average and instantaneous speed.' },
                { heading: 'Lab Note', body: 'Use consistent units and label your axes.' }
            ]
        }
    }
};
