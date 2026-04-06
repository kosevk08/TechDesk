const user = JSON.parse(localStorage.getItem('user'));
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io('https://techdesk-frontend.onrender.com');
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);

const egnToName = {
    '1000000001': 'Viktor Kolev',
    '1000000002': 'Konstantin Kosev',
    '1000000003': 'Ivan Ivanov',
    '1000000004': 'John Doe',
    '1000000005': 'Daniel Kovacs',
    '1000000006': 'Sofia Martinez',
    '1000000007': 'Marcus Bennett',
    '1000000008': 'Elena Petrova',
    '1000000009': 'Liam O\'Connor',
    '1000000010': 'Victor Ivanov',
    '1000000011': 'Natalie Fischer',
    '1000000012': 'Carlos Mendes',
    '9000000001': 'Radoslav Paskalev'
};

function authHeaders(extra = {}) {
    return extra;
}

const SUBJECT_META = {
    'maths': { icon: '📐', accent: '#6366f1', accentEnd: '#8b5cf6', iconBg: 'rgba(99,102,241,0.1)', iconBgEnd: 'rgba(139,92,246,0.08)' },
    'mathematics': { icon: '📐', accent: '#6366f1', accentEnd: '#8b5cf6', iconBg: 'rgba(99,102,241,0.1)', iconBgEnd: 'rgba(139,92,246,0.08)' },
    'physics': { icon: '⚛️', accent: '#3b82f6', accentEnd: '#06b6d4', iconBg: 'rgba(59,130,246,0.1)', iconBgEnd: 'rgba(6,182,212,0.08)' },
    'chemistry': { icon: '🧪', accent: '#10b981', accentEnd: '#14b8a6', iconBg: 'rgba(16,185,129,0.1)', iconBgEnd: 'rgba(20,184,166,0.08)' },
    'biology': { icon: '🧬', accent: '#22c55e', accentEnd: '#10b981', iconBg: 'rgba(34,197,94,0.1)', iconBgEnd: 'rgba(16,185,129,0.08)' },
    'english': { icon: '🇬🇧', accent: '#f59e0b', accentEnd: '#f97316', iconBg: 'rgba(245,158,11,0.1)', iconBgEnd: 'rgba(249,115,22,0.08)' },
    'bulgarian language and literature': { icon: '📝', accent: '#ec4899', accentEnd: '#f43f5e', iconBg: 'rgba(236,72,153,0.1)', iconBgEnd: 'rgba(244,63,94,0.08)' },
    'english literature': { icon: '📚', accent: '#a855f7', accentEnd: '#d946ef', iconBg: 'rgba(168,85,247,0.1)', iconBgEnd: 'rgba(217,70,239,0.08)' },
    'geography': { icon: '🌍', accent: '#06b6d4', accentEnd: '#0ea5e9', iconBg: 'rgba(6,182,212,0.1)', iconBgEnd: 'rgba(14,165,233,0.08)' },
    'philosophy': { icon: '💭', accent: '#8b5cf6', accentEnd: '#a78bfa', iconBg: 'rgba(139,92,246,0.1)', iconBgEnd: 'rgba(167,139,250,0.08)' },
    'social anthropology': { icon: '🏛️', accent: '#f43f5e', accentEnd: '#e11d48', iconBg: 'rgba(244,63,94,0.1)', iconBgEnd: 'rgba(225,29,72,0.08)' },
    'german (a1)': { icon: '🇩🇪', accent: '#eab308', accentEnd: '#f59e0b', iconBg: 'rgba(234,179,8,0.1)', iconBgEnd: 'rgba(245,158,11,0.08)' },
    'spanish (a1)': { icon: '🇪🇸', accent: '#ef4444', accentEnd: '#f97316', iconBg: 'rgba(239,68,68,0.1)', iconBgEnd: 'rgba(249,115,22,0.08)' },
};

function getSubjectMeta(name) {
    const key = (name || '').toLowerCase();
    return SUBJECT_META[key] || { icon: '📖', accent: '#30aaba', accentEnd: '#6366f1', iconBg: 'rgba(48,170,186,0.1)', iconBgEnd: 'rgba(99,102,241,0.08)' };
}

function buildSubjectCard(subject) {
    const meta = getSubjectMeta(subject.name);
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.setProperty('--accent', meta.accent);
    card.style.setProperty('--accent-end', meta.accentEnd);
    card.style.setProperty('--icon-bg', meta.iconBg);
    card.style.setProperty('--icon-bg-end', meta.iconBgEnd);
    card.innerHTML = `
        <div class="subject-icon">${meta.icon}</div>
        <h4>${subject.name}</h4>
        <button class="subject-btn" onclick="openSubject(${subject.id})">
            📖 Open Notebook
        </button>
    `;
    return card;
}

if (!user || user.role !== 'STUDENT') {
    window.location.href = '/';
}

const displayName = egnToName[user.egn] || user.email.split('@')[0];

if (isDemo && demoData) {
    document.getElementById('studentName').textContent = demoData.student.name;
    document.getElementById('studentClass').textContent = demoData.student.className;
} else {
    document.getElementById('studentName').textContent = displayName;
    document.getElementById('studentClass').textContent = '11D';
}

function insertDemoBanner() {
    const container = document.querySelector('.container');
    const hero = document.querySelector('.hero-panel');
    if (!container || !hero) return;
    const banner = document.createElement('div');
    banner.className = 'ai-panel section-card';
    banner.innerHTML = `
        <h4>Demo Mode</h4>
        <p>${demoData?.demoNotice || 'Explore safely with demo data only.'}</p>
        <p class="insight-copy"><strong>Features:</strong> Grades, Attendance, Messages, Schedule, Homework, Tests, Notebook.</p>
        <div class="insight-card">
            <div class="insight-top">
                <h5>What to try</h5>
            </div>
            <p class="insight-copy">Open subjects, review grades, submit a demo test, and check attendance.</p>
        </div>
    `;
    hero.insertAdjacentElement('afterend', banner);
}

function insertDemoStudentSections() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    const scheduleCard = document.createElement('div');
    scheduleCard.className = 'card';
    scheduleCard.innerHTML = `
        <h3>Schedule</h3>
        <p>Weekly timetable with class periods.</p>
        <button class="action-btn" onclick="document.getElementById('demoScheduleSection').scrollIntoView({ behavior: 'smooth' })">View Schedule</button>
    `;
    const homeworkCard = document.createElement('div');
    homeworkCard.className = 'card';
    homeworkCard.innerHTML = `
        <h3>Homework</h3>
        <p>Assignments and due dates.</p>
        <button class="action-btn" onclick="document.getElementById('demoHomeworkSection').scrollIntoView({ behavior: 'smooth' })">View Homework</button>
    `;
    grid.appendChild(scheduleCard);
    grid.appendChild(homeworkCard);

    const container = document.querySelector('.container');
    const scheduleSection = document.createElement('div');
    scheduleSection.className = 'card section-card';
    scheduleSection.id = 'demoScheduleSection';
    scheduleSection.innerHTML = `
        <div class="section-header">
            <div>
                <span class="section-eyebrow">Weekly Timetable</span>
                <h3 class="section-title">Schedule</h3>
            </div>
        </div>
        <div id="demoScheduleList"></div>
    `;
    const homeworkSection = document.createElement('div');
    homeworkSection.className = 'card section-card';
    homeworkSection.id = 'demoHomeworkSection';
    homeworkSection.innerHTML = `
        <div class="section-header">
            <div>
                <span class="section-eyebrow">Assignments</span>
                <h3 class="section-title">Homework</h3>
            </div>
        </div>
        <div id="demoHomeworkList"></div>
    `;
    container.appendChild(scheduleSection);
    container.appendChild(homeworkSection);
    renderDemoSchedule();
    renderDemoHomework();
}

function renderDemoSchedule() {
    const container = document.getElementById('demoScheduleList');
    if (!container || !demoData?.schedule) return;
    container.innerHTML = Object.entries(demoData.schedule.week).map(([day, items]) => `
        <div class="test-card">
            <h5>${day}</h5>
            ${items.map(item => `<div class="test-meta">${item.time} • ${item.subject} (${item.room}) • ${item.teacher}</div>`).join('')}
        </div>
    `).join('');
}

function renderDemoHomework() {
    const container = document.getElementById('demoHomeworkList');
    if (!container || !demoData?.homework) return;
    container.innerHTML = demoData.homework.map(hw => `
        <div class="test-card">
            <h5>${hw.subject}: ${hw.title}</h5>
            <div class="test-meta">Due ${hw.dueDate} • ${hw.status}</div>
            <div class="test-meta">${hw.details}</div>
        </div>
    `).join('');
}

async function loadSubjects() {
    try {
        if (isDemo && demoData) {
            const subjects = demoData.subjects;
            const grid = document.getElementById('subjectsGrid');
            grid.innerHTML = '';
            subjects.forEach(subject => {
                grid.appendChild(buildSubjectCard(subject));
            });
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/subject/all`, {
            headers: authHeaders()
        });
        const subjects = await response.json();
        const grid = document.getElementById('subjectsGrid');
        grid.innerHTML = '';

        if (subjects.length === 0) {
            grid.innerHTML = '<p class="empty-state">No subjects available yet.</p>';
            return;
        }

        subjects.forEach(subject => {
            grid.appendChild(buildSubjectCard(subject));
        });
    } catch (error) {
        console.error('Could not load subjects:', error);
    }
}

async function loadAttendanceSummary() {
    try {
        if (isDemo && demoData) {
            const records = demoData.attendance;
            const present = records.filter(r => r.status === 'PRESENT').length;
            const absent = records.filter(r => r.status === 'ABSENT_UNEXCUSED' || r.status === 'ABSENT_EXCUSED').length;
            const total = records.length;
            const latest = records.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            const summary = document.getElementById('attendanceSummary');
            if (summary) summary.textContent = total ? `${total} records, ${absent} absent` : 'No records yet';

            document.getElementById('attendanceTotal').textContent = total || '-';
            document.getElementById('attendancePresent').textContent = total ? present : '-';
            document.getElementById('attendanceAbsent').textContent = total ? absent : '-';
            document.getElementById('attendanceLatest').textContent = latest ? latest.status : '-';
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/attendance/student/${user.egn}?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const records = res.ok ? await res.json() : [];
        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const total = records.length;
        const latest = records.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const summary = document.getElementById('attendanceSummary');
        if (summary) summary.textContent = total ? `${total} records, ${absent} absent` : 'No records yet';

        if (document.getElementById('attendanceTotal')) document.getElementById('attendanceTotal').textContent = total || '-';
        if (document.getElementById('attendancePresent')) document.getElementById('attendancePresent').textContent = total ? present : '-';
        if (document.getElementById('attendanceAbsent')) document.getElementById('attendanceAbsent').textContent = total ? absent : '-';
        if (document.getElementById('attendanceLatest')) document.getElementById('attendanceLatest').textContent = latest ? latest.status : '-';
    } catch (error) {
        console.error('Could not load attendance summary:', error);
    }
}

const AI_TRACKER_URL = `${BACKEND_BASE_URL}/api/ai/task-data`;

function sendAiTaskData(taskData) {
    if (isDemo) return;
    const payload = JSON.stringify(taskData);
    try {
        fetch(AI_TRACKER_URL, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: payload,
            keepalive: true
        })
        .then((response) => {
            if (!response.ok) {
                console.warn('AI task tracking returned non-ok status:', response.status);
                return;
            }
            console.log('AI task tracking dispatched successfully');
        })
        .catch((error) => {
            console.error('AI task tracking request failed (silent):', error);
        });
    } catch (error) {
        console.error('AI task tracking request failed (silent):', error);
    }
}

function trackTaskCompletion(taskData) {
    const payload = {
        studentId: displayName,
        completed: true,
        skipped: false,
        ...taskData
    };

    if (!payload.subject) {
        const subjectId = localStorage.getItem('currentSubject');
        const subjectCard = document.querySelector(`[onclick="openSubject(${subjectId})"] h3`);
        payload.subject = subjectCard ? subjectCard.textContent.trim() : null;
    }

    sendAiTaskData(payload);
}

window.trackTaskCompletion = trackTaskCompletion;

function openSubject(subjectId) {
    localStorage.setItem('currentSubject', subjectId);
    window.location.href = '/notebook';
}

if (isDemo) {
    insertDemoBanner();
    insertDemoStudentSections();
}

loadSubjects();
loadAttendanceSummary();
loadStudentTests();
loadStudentGrades();
loadStudentNotifications();

if (!isDemo) {
    socket.on('attendance-updated', (data) => {
        if (data?.studentName && data.studentName === displayName) {
            loadAttendanceSummary();
        }
    });

    socket.on('test-assigned', () => {
        loadStudentTests();
    });

    socket.on('test-graded', (data) => {
        if (data?.studentName && data.studentName === displayName) {
            loadStudentTests();
        }
    });

    socket.on('grade-updated', (data) => {
        if (data?.studentName && data.studentName === displayName) {
            loadStudentGrades();
            loadStudentNotifications();
        }
    });
}

function renderStudentTests(tests) {
    const list = document.getElementById('studentTestsList');
    if (!list) return;
    if (!tests.length) {
        list.innerHTML = '<p class="empty-state">No tests assigned yet.</p>';
        return;
    }

    list.innerHTML = tests.map(test => {
        let questions = [];
        if (test.questionsJson) {
            try {
                questions = JSON.parse(test.questionsJson);
            } catch (e) {
                questions = [];
            }
        }
        const due = test.dueDate ? `Due ${test.dueDate}` : 'No deadline';
        const status = test.status || 'ASSIGNED';
        const disabled = status !== 'ASSIGNED' ? 'disabled' : '';
        return `
            <div class="test-card">
                <h5>${test.title}</h5>
                <div class="test-meta">${test.subject || 'General'} • ${due}</div>
                <div class="test-meta">Status: ${status}${test.score !== null && test.score !== undefined ? ` • Score: ${test.score}` : ''}</div>
                ${test.feedback ? `<div class="test-meta">Feedback: ${test.feedback}</div>` : ''}
                <div class="test-meta">Questions:</div>
                <ul class="test-meta">
                    ${questions.map(q => `<li>${q}</li>`).join('')}
                </ul>
                <textarea class="student-answer" id="answer-${test.testId}" placeholder="Type your answers here..."></textarea>
                <div class="test-actions">
                    <button class="action-btn" onclick="submitTest(${test.testId})" ${disabled}>Submit</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderUpcomingTests(tests) {
    const list = document.getElementById('testsList');
    if (!list) return;
    if (!tests.length) {
        list.innerHTML = '<li>No upcoming tests</li>';
        return;
    }
    list.innerHTML = tests.map(test => `<li>${test.title} • ${test.dueDate || 'No deadline'}</li>`).join('');
}

async function loadStudentTests() {
    try {
        if (isDemo && demoData) {
            renderStudentTests(demoData.tests);
            renderUpcomingTests(demoData.tests);
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/student/me?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const tests = res.ok ? await res.json() : [];
        renderStudentTests(tests);
        renderUpcomingTests(tests);
    } catch (error) {
        console.error('Could not load student tests:', error);
        renderStudentTests([]);
        renderUpcomingTests([]);
    }
}

async function submitTest(testId) {
    const answersField = document.getElementById(`answer-${testId}`);
    if (!answersField) return;
    const answersJson = JSON.stringify({ answer: answersField.value });
    try {
        if (isDemo && demoData) {
            const test = demoData.tests.find(t => t.testId === testId);
            if (test) {
                test.status = 'SUBMITTED';
                test.feedback = 'Submission received (demo).';
            }
            loadStudentTests();
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/${testId}/submit`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ answersJson })
        });
        if (!res.ok) throw new Error(`Submit failed ${res.status}`);
        await res.json();
        socket.emit('test-submitted', { testId, studentName: displayName });
        loadStudentTests();
    } catch (error) {
        console.error('Could not submit test:', error);
    }
}

window.loadStudentTests = loadStudentTests;
window.submitTest = submitTest;

async function loadStudentGrades() {
    const list = document.getElementById('studentGradesList');
    const averages = document.getElementById('studentAverages');
    if (!list || !averages) return;
    list.innerHTML = '<p class="empty-state">Loading grades...</p>';
    averages.innerHTML = '';

    try {
        if (isDemo && demoData) {
            const grades = demoData.grades;
            const avg = demoData.averages;

            if (!grades.length) {
                list.innerHTML = '<p class="empty-state">No grades yet.</p>';
            } else {
                list.innerHTML = grades.map(g => `
                    <div class="test-card">
                        <h5>${g.subject}: ${g.value}</h5>
                        <div class="test-meta">${g.comment || 'No comment'}</div>
                        <div class="test-meta">Added: ${g.createdAt ? g.createdAt.replace('T', ' ') : '-'}</div>
                    </div>
                `).join('');
            }

            const avgEntries = Object.entries(avg);
            if (avgEntries.length) {
                averages.innerHTML = avgEntries.map(([subject, value]) => `
                    <div class="metric-card">
                        <span class="metric-label">${subject}</span>
                        <strong class="metric-value">${Number(value).toFixed(2)}</strong>
                    </div>
                `).join('');
            }
            return;
        }
        list.innerHTML = '<p class="empty-state">No grades yet.</p>';
    } catch (error) {
        console.error('Could not load grades:', error);
        list.innerHTML = '<p class="empty-state">Failed to load grades.</p>';
    }
}

async function loadStudentNotifications() {
    const container = document.getElementById('studentNotifications');
    if (!container) return;
    try {
        if (isDemo && demoData) {
            const notifications = demoData.notifications;
            container.innerHTML = notifications.slice(0, 6).map(n => `
                <div class="insight-card">
                    <div class="insight-top">
                        <h5>${n.type}</h5>
                        <span class="metric-label">${(n.createdAt || '').replace('T', ' ')}</span>
                    </div>
                    <p class="insight-copy">${n.message}</p>
                </div>
            `).join('');
            return;
        }
        container.innerHTML = '<p class="empty-state">No notifications yet.</p>';
    } catch (error) {
        console.error('Could not load notifications:', error);
    }
}

window.loadStudentGrades = loadStudentGrades;