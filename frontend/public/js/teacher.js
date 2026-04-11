const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io('https://techdesk-frontend.onrender.com');
const user = JSON.parse(localStorage.getItem('user'));
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);
let studentNames = [];

function authHeaders(extra = {}) {
    return extra;
}

const teacherNames = {
    'h.schmidt-teacher@edu-school.bg': 'Miss Schmidt',
    'a.popescu-teacher@edu-school.bg': 'Mr Popescu',
    'e.vasileva-teacher@edu-school.bg': 'Mrs Vasileva'
};

const egnToName = {
    '1000000001': 'Victor Kolev',
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

if (!user || user.role !== 'TEACHER') {
    window.location.href = '/';
}

if (isDemo && demoData) {
    document.getElementById('teacherName').textContent = demoData.teacher.name;
} else {
    document.getElementById('teacherName').textContent = teacherNames[user.email] || user.email;
}

if (isDemo) {
    insertDemoBanner();
    insertDemoTeacherSections();
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
        <p class="insight-copy"><strong>Features:</strong> Grades, Attendance, Messages, Schedule, Homework, Tests, Notebooks, AI Insights.</p>
        <div class="insight-card">
            <div class="insight-top">
                <h5>What to try</h5>
            </div>
            <p class="insight-copy">Create a demo test, add a grade, and preview student notebooks.</p>
        </div>
    `;
    hero.insertAdjacentElement('afterend', banner);
}

function insertDemoTeacherSections() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    const scheduleCard = document.createElement('div');
    scheduleCard.className = 'card';
    scheduleCard.innerHTML = `
        <h3>Schedule</h3>
        <p>View a sample weekly timetable.</p>
        <button class="action-btn" onclick="document.getElementById('demoScheduleSection').scrollIntoView({ behavior: 'smooth' })">View Schedule</button>
    `;
    const homeworkCard = document.createElement('div');
    homeworkCard.className = 'card';
    homeworkCard.innerHTML = `
        <h3>Homework</h3>
        <p>See assigned homework items.</p>
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

let currentViewEgn = null;
let currentViewStudent = null;
let currentViewSubject = null;
let currentViewPage = 1;
const teacherCanvas = document.getElementById('teacherCanvas');
const tCtx = teacherCanvas.getContext('2d');
const aiStatusText = document.getElementById('aiStatusText');
const aiStatusBanner = document.getElementById('aiStatusBanner');

function showSection(sectionId) {
    ['aiInsightsSection', 'notebookViewer', 'testsSection', 'gradesSection'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';
}

function subjectMatch(a, b) {
    return a && b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

if (!isDemo) {
    socket.on('draw-stroke', (data) => {
        if (data.studentEgn === currentViewEgn &&
            subjectMatch(data.subject, currentViewSubject) &&
            parseInt(data.page) === parseInt(currentViewPage)) {
            document.getElementById('liveBadge').style.display = 'inline';
            if (data.tool === 'eraser') {
                tCtx.clearRect(data.x1 - 10, data.y1 - 10, 20, 20);
            } else {
                tCtx.beginPath();
                tCtx.moveTo(data.x0, data.y0);
                tCtx.lineTo(data.x1, data.y1);
                tCtx.strokeStyle = data.color;
                tCtx.lineWidth = data.size;
                tCtx.lineCap = 'round';
                tCtx.stroke();
            }
        }
    });

    socket.on('clear-canvas', (data) => {
        if (data.studentEgn === currentViewEgn &&
            subjectMatch(data.subject, currentViewSubject) &&
            parseInt(data.page) === parseInt(currentViewPage)) {
            tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
        }
    });

    socket.on('page-change', (data) => {
        if (data.studentEgn === currentViewEgn && subjectMatch(data.subject, currentViewSubject)) {
            currentViewPage = data.page;
            document.getElementById('notebookTitle').textContent =
                `${currentViewStudent} - ${currentViewSubject} (Page ${currentViewPage})`;
            tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
            loadTeacherPage();
        }
    });
}

async function loadNotifications() {
    const container = document.getElementById('teacherNotifications');
    if (!container) return;
    try {
        if (isDemo && demoData) {
            container.innerHTML = demoData.notifications.slice(0, 6).map(n => `
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

async function loadStudentNames() {
    if (isDemo && demoData) {
        studentNames = [{ fullName: demoData.student.name, egn: '9000000001' }];
        return;
    }
    studentNames = Object.entries(egnToName).map(([egn, name]) => ({ fullName: name, egn }));
}

function setGradeStatus(text) {
    const status = document.getElementById('gradeStatus');
    if (status) status.textContent = text;
}

function populateGradeStudents() {
    const select = document.getElementById('gradeStudent');
    if (!select) return;
    select.innerHTML = '';
    if (isDemo && demoData) {
        const option = document.createElement('option');
        option.value = demoData.student.name;
        option.textContent = demoData.student.name;
        select.appendChild(option);
        return;
    }
    studentNames.forEach((student) => {
        const option = document.createElement('option');
        option.value = student.fullName;
        option.textContent = student.fullName;
        select.appendChild(option);
    });
}

async function addGrade() {
    const studentName = document.getElementById('gradeStudent').value;
    const subject = document.getElementById('gradeSubject').value.trim();
    const value = parseFloat(document.getElementById('gradeValue').value);
    const comment = document.getElementById('gradeComment').value.trim();
    if (!studentName || !subject || Number.isNaN(value)) {
        setGradeStatus('Student, subject, and grade are required.');
        return;
    }
    try {
        setGradeStatus('Saving grade...');
        if (isDemo && demoData) {
            demoData.grades.unshift({ subject, value, comment: comment || 'Demo grade saved.', createdAt: new Date().toISOString() });
            setGradeStatus('Grade saved (demo).');
            document.getElementById('gradeValue').value = '';
            document.getElementById('gradeComment').value = '';
            loadGradeHistory();
            return;
        }
        setGradeStatus('Grades not yet connected to backend.');
    } catch (error) {
        setGradeStatus('Failed to save grade.');
    }
}

async function loadGradeHistory() {
    const container = document.getElementById('gradeHistoryList');
    if (!container) return;
    container.innerHTML = '<p class="empty-state">Loading...</p>';
    try {
        if (isDemo && demoData) {
            const grades = demoData.grades;
            if (!grades.length) {
                container.innerHTML = '<p class="empty-state">No grades yet.</p>';
                return;
            }
            container.innerHTML = grades.map(g => `
                <div class="test-card">
                    <h5>${g.subject}: ${g.value}</h5>
                    <div class="test-meta">${g.comment || 'No comment'}</div>
                    <div class="test-meta">Saved: ${g.createdAt ? g.createdAt.replace('T', ' ') : '-'}</div>
                </div>
            `).join('');
            return;
        }
        container.innerHTML = '<p class="empty-state">No grades yet.</p>';
    } catch (error) {
        container.innerHTML = '<p class="empty-state">Failed to load grades.</p>';
    }
}

async function loadGrades() {
    showSection('gradesSection');
    await loadStudentNames();
    populateGradeStudents();
    await loadGradeHistory();
}

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'gradeStudent') loadGradeHistory();
});

loadNotifications();
async function loadTeacherPage() {
    try {
        if (isDemo && demoData) {
            renderDemoNotebookPage(demoData.notebooks[0]);
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/notebook/student/${currentViewEgn}/${encodeURIComponent(currentViewSubject)}/${currentViewPage}?t=${Date.now()}`);
        const img = document.getElementById('notebookImage');
        if (res.ok) {
            const notebook = await res.json();
            if (notebook && notebook.content && notebook.content.startsWith('data:image')) {
                img.src = notebook.content;
                img.style.display = 'block';
            } else {
                img.src = '';
                img.style.display = 'none';
            }
        } else {
            img.src = '';
            img.style.display = 'none';
        }
    } catch (err) {
        console.error('Could not load page:', err);
    }
}

function renderDemoNotebookPage(notebook) {
    const img = document.getElementById('notebookImage');
    img.src = '';
    img.style.display = 'none';
    tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
    tCtx.fillStyle = '#1b1b1b';
    tCtx.font = '20px sans-serif';
    tCtx.fillText('Demo Notebook Preview', 20, 40);
    tCtx.font = '16px sans-serif';
    if (notebook) {
        tCtx.fillText(`${notebook.subject} • ${notebook.studentName}`, 20, 70);
        tCtx.fillText(notebook.preview, 20, 110);
    }
}

async function loadNotebooks() {
    try {
        const section = document.getElementById('notebooksSection');
        const list = document.getElementById('notebooksList');
        section.style.display = 'block';
        list.innerHTML = '';

        if (isDemo && demoData) {
            demoData.notebooks.forEach(notebook => {
                const card = document.createElement('div');
                card.className = 'notebook-card';
                card.innerHTML = `
                    <div>
                        <h4>${notebook.studentName}</h4>
                        <p>Subject: ${notebook.subject} | Page: ${notebook.page}</p>
                    </div>
                    <button class="view-btn" onclick="viewNotebook('9000000001', '${notebook.studentName}', '${notebook.subject}')">
                        Preview
                    </button>
                `;
                list.appendChild(card);
            });
            return;
        }

        const response = await fetch(`${BACKEND_BASE_URL}/api/notebook/all?t=${Date.now()}`);
        const notebooks = await response.json();

        const uniqueNotebooks = [];
        const seen = new Set();
        notebooks.forEach(n => {
            const key = `${n.studentEgn}-${n.subject}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueNotebooks.push(n);
            }
        });

        if (uniqueNotebooks.length === 0) {
            list.innerHTML = '<p>No notebooks found.</p>';
            return;
        }

        uniqueNotebooks.forEach(notebook => {
            const studentName = egnToName[notebook.studentEgn] || notebook.studentEgn;
            const card = document.createElement('div');
            card.className = 'notebook-card';
            card.innerHTML = `
                <div>
                    <h4>${studentName}</h4>
                    <p>Subject: ${notebook.subject} | Year: ${notebook.schoolYear}</p>
                </div>
                <button class="view-btn" onclick="viewNotebook('${notebook.studentEgn}', '${studentName}', '${notebook.subject}')">
                    View
                </button>
            `;
            list.appendChild(card);
        });

    } catch (error) {
        console.error('Could not load notebooks:', error);
    }
}

function viewNotebook(egn, studentName, subject) {
    currentViewEgn = egn;
    currentViewStudent = studentName;
    currentViewSubject = subject;
    currentViewPage = 1;

    document.getElementById('notebooksSection').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'block';
    document.getElementById('notebookTitle').textContent = `${studentName} - ${subject} (Page 1)`;
    document.getElementById('liveBadge').style.display = 'none';

    const wrapper = document.getElementById('notebookCanvasWrapper');
    const isMaths = subject.toLowerCase() === 'maths';
    wrapper.className = 'notebook-canvas-wrapper ' + (isMaths ? 'squared' : 'lined');

    teacherCanvas.width = wrapper.clientWidth;
    teacherCanvas.height = wrapper.clientHeight;
    tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);

    loadTeacherPage();
}

function backToList() {
    currentViewEgn = null;
    currentViewStudent = null;
    currentViewSubject = null;
    currentViewPage = 1;
    document.getElementById('liveBadge').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'none';
    document.getElementById('notebooksSection').style.display = 'block';
}

function formatPercent(value) { return `${Number(value || 0).toFixed(1)}%`; }
function formatSeconds(value) { return `${Math.round(value || 0)}s`; }
function riskBadgeClass(level) { return `risk-badge risk-${String(level || 'low').toLowerCase()}`; }

function setAiStatus(message, type = 'info') {
    if (aiStatusText) aiStatusText.textContent = message;
    if (!message) {
        aiStatusBanner.style.display = 'none';
        aiStatusBanner.className = 'ai-status-banner';
        return;
    }
    aiStatusBanner.textContent = message;
    aiStatusBanner.className = `ai-status-banner${type === 'error' ? ' error' : ''}`;
    aiStatusBanner.style.display = 'block';
}

function renderOverview(overview) {
    const grid = document.getElementById('aiOverviewGrid');
    const metrics = [
        { label: 'Tracked Tasks', value: overview.totalTasks ?? 0 },
        { label: 'Accuracy', value: formatPercent(overview.accuracyRate) },
        { label: 'Average Time', value: formatSeconds(overview.averageTimeSpentSeconds) },
        { label: 'Average Attempts', value: Number(overview.averageAttempts ?? 0).toFixed(1) },
        { label: 'Struggling Students', value: overview.strugglingStudentsCount ?? 0 },
        { label: 'Attention Alerts', value: overview.attentionAlertsCount ?? 0 }
    ];
    grid.innerHTML = metrics.map((m) => `
        <div class="metric-card">
            <span class="metric-label">${m.label}</span>
            <strong class="metric-value">${m.value}</strong>
        </div>
    `).join('');
}

function renderStudents(students) {
    const container = document.getElementById('aiStudentsList');
    if (!students || !students.length) {
        container.innerHTML = '<p class="empty-state">No students currently flagged for attention.</p>';
        return;
    }
    container.innerHTML = students.map((s) => `
        <div class="insight-card">
            <div class="insight-top">
                <div>
                    <h5>${s.studentName}</h5>
                    <p>${s.className} • ${s.adaptiveRecommendation.replaceAll('_', ' ')}</p>
                </div>
                <span class="${riskBadgeClass(s.riskLevel)}">${s.riskLevel}</span>
            </div>
            <div class="insight-stats">
                <span>Accuracy ${formatPercent(s.accuracyRate)}</span>
                <span>Time ${formatSeconds(s.averageTimeSpentSeconds)}</span>
                <span>Attempts ${Number(s.averageAttempts || 0).toFixed(1)}</span>
            </div>
            <p class="insight-copy">${s.recommendedAction}</p>
            <p class="insight-weaknesses"><strong>Weakness areas:</strong> ${(s.weaknessAreas || []).join(', ') || 'No clear pattern yet'}</p>
        </div>
    `).join('');
}

function renderAlerts(alerts) {
    const container = document.getElementById('aiAlertsList');
    if (!alerts || !alerts.length) {
        container.innerHTML = '<p class="empty-state">No active alerts right now.</p>';
        return;
    }
    container.innerHTML = alerts.map((a) => `
        <div class="alert-card alert-${String(a.severity || 'medium').toLowerCase()}">
            <div class="insight-top">
                <h5>${a.title}</h5>
                <span class="${riskBadgeClass(a.severity)}">${a.severity}</span>
            </div>
            <p class="insight-copy">${a.message}</p>
        </div>
    `).join('');
}

function renderTopics(topics) {
    const container = document.getElementById('aiTopicsList');
    if (!topics || !topics.length) {
        container.innerHTML = '<p class="empty-state">No topic analytics available yet.</p>';
        return;
    }
    container.innerHTML = topics.map((t) => `
        <div class="topic-row">
            <div>
                <h5>${t.label}</h5>
                <p>${t.subject}</p>
            </div>
            <div class="topic-metrics">
                <span>${formatPercent(t.accuracyRate)} accuracy</span>
                <span>${formatSeconds(t.averageTimeSpentSeconds)} avg time</span>
                <span>${Number(t.averageAttempts || 0).toFixed(1)} attempts</span>
                <span class="${riskBadgeClass(t.difficultyLevel)}">${t.difficultyLevel}</span>
            </div>
            <p class="insight-copy">${t.teacherAction}</p>
        </div>
    `).join('');
}

async function loadAiInsights() {
    showSection('aiInsightsSection');
    if (isDemo) {
        renderOverview({ totalTasks: 42, accuracyRate: 0.82, averageTimeSpentSeconds: 64, averageAttempts: 1.6, strugglingStudentsCount: 1, attentionAlertsCount: 2 });
        renderStudents([{ studentName: demoData.student.name, className: demoData.student.className, adaptiveRecommendation: 'FOCUS_REVIEW', riskLevel: 'medium', accuracyRate: 0.68, averageTimeSpentSeconds: 85, averageAttempts: 2.1, recommendedAction: 'Schedule a quick recap on factoring.', weaknessAreas: ['Quadratic factoring', 'Word problems'] }]);
        renderAlerts([{ title: 'Physics Momentum', severity: 'medium', message: 'Several students spend extra time on momentum problems.' }]);
        renderTopics([{ label: 'Quadratic Equations', subject: 'Maths', accuracyRate: 0.72, averageTimeSpentSeconds: 88, averageAttempts: 2.4, difficultyLevel: 'medium', teacherAction: 'Re-teach factoring with a short guided example.' }]);
        setAiStatus('Demo AI data loaded for exploration.');
        return;
    }
    setAiStatus('AI Insights not yet connected to backend.');
    renderOverview({});
    renderStudents([]);
    renderAlerts([]);
    renderTopics([]);
}

async function loadClasses() {
    const select = document.getElementById('testClass');
    if (!select) return;
    select.innerHTML = '';
    if (isDemo) {
        const option = document.createElement('option');
        option.value = demoData.student.className;
        option.textContent = demoData.student.className;
        select.appendChild(option);
        return;
    }
    const option = document.createElement('option');
    option.value = '11D';
    option.textContent = '11D';
    select.appendChild(option);
}

function setTestStatus(text) {
    const status = document.getElementById('testStatus');
    if (status) status.textContent = text;
}

async function createTest() {
    const title = document.getElementById('testTitle').value.trim();
    const subject = document.getElementById('testSubject').value.trim();
    const description = document.getElementById('testDescription').value.trim();
    const questionsInput = document.getElementById('testQuestions').value.trim();
    const totalPoints = parseInt(document.getElementById('testPoints').value || '0', 10);
    const className = document.getElementById('testClass').value;
    const dueDate = document.getElementById('testDueDate').value;

    if (!title || !className) {
        setTestStatus('Title and class are required.');
        return;
    }

    const questions = questionsInput ? questionsInput.split('\n').map(q => q.trim()).filter(Boolean) : [];

    try {
        setTestStatus('Creating test...');
        if (isDemo && demoData) {
            const id = Math.floor(Date.now() / 1000);
            demoData.teacherTests.unshift({ id, title, subject, assignments: [{ className, dueDate }] });
            demoData.tests.unshift({ testId: id, title, subject, dueDate, questionsJson: JSON.stringify(questions), status: 'ASSIGNED', score: null, feedback: null });
            setTestStatus('Test created and assigned (demo).');
            document.getElementById('testTitle').value = '';
            document.getElementById('testSubject').value = '';
            document.getElementById('testDescription').value = '';
            document.getElementById('testQuestions').value = '';
            document.getElementById('testPoints').value = '';
            loadTests();
            return;
        }
        setTestStatus('Tests not yet connected to backend.');
    } catch (error) {
        setTestStatus('Failed to create test.');
    }
}

function renderTests(tests) {
    const list = document.getElementById('testsList');
    if (!list) return;
    if (!tests.length) {
        list.innerHTML = '<p class="empty-state">No tests created yet.</p>';
        return;
    }
    list.innerHTML = tests.map(test => {
        const assignments = test.assignments || [];
        const assignmentText = assignments.length ? assignments.map(a => `${a.className}${a.dueDate ? ` • due ${a.dueDate}` : ''}`).join(', ') : 'Not assigned yet';
        return `
            <div class="test-card">
                <h5>${test.title}</h5>
                <div class="test-meta">${test.subject || 'General'} • ${assignmentText}</div>
                <div class="test-actions">
                    <button class="action-btn secondary-btn" onclick="loadSubmissions(${test.id})">View Submissions</button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadSubmissions(testId) {
    const panel = document.getElementById('submissionsPanel');
    const list = document.getElementById('submissionsList');
    if (!panel || !list) return;
    panel.style.display = 'block';
    list.innerHTML = '<p class="empty-state">Loading submissions...</p>';
    try {
        if (isDemo && demoData) {
            const submissions = demoData.testSubmissions[testId] || [];
            if (!submissions.length) {
                list.innerHTML = '<p class="empty-state">No submissions yet.</p>';
                return;
            }
            list.innerHTML = submissions.map(sub => `
                <div class="submission-card">
                    <strong>Student: ${demoData.student.name}</strong>
                    <div class="test-meta">Status: ${sub.status || 'SUBMITTED'}</div>
                    <div class="test-meta">Answers:</div>
                    <pre class="test-meta">${sub.answersJson || ''}</pre>
                    <div class="test-row">
                        <input type="number" min="0" placeholder="Score" id="score-${sub.id}" value="${sub.score ?? ''}">
                        <input type="text" placeholder="Feedback" id="feedback-${sub.id}" value="${sub.feedback ?? ''}">
                        <button class="action-btn" onclick="gradeSubmission(${sub.id}, '${demoData.student.name}')">Grade</button>
                    </div>
                </div>
            `).join('');
            return;
        }
        list.innerHTML = '<p class="empty-state">No submissions yet.</p>';
    } catch (error) {
        list.innerHTML = '<p class="empty-state">Failed to load submissions.</p>';
    }
}

async function gradeSubmission(submissionId, studentName) {
    if (isDemo && demoData) {
        const submissions = Object.values(demoData.testSubmissions).flat();
        const sub = submissions.find(s => s.id === submissionId);
        if (sub) { sub.score = null; sub.feedback = 'Demo feedback saved.'; sub.status = 'GRADED'; }
        return;
    }
}

async function loadTests() {
    showSection('testsSection');
    await loadClasses();
    try {
        if (isDemo && demoData) {
            renderTests(demoData.teacherTests || []);
            return;
        }
        renderTests([]);
    } catch (error) {
        console.error('Could not load tests:', error);
    }
}