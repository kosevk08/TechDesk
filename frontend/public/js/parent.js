const user = JSON.parse(localStorage.getItem('user'));
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io();
const token = localStorage.getItem('token');
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);

function authHeaders(extra = {}) {
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

if (!user || user.role !== 'PARENT') {
    window.location.href = '/';
}
if (isDemo) {
    insertDemoBanner();
    insertDemoParentSections();
}

if (isDemo && demoData) {
    document.getElementById('parentName').textContent = demoData.parent.name;
    document.getElementById('studentName').textContent = demoData.student.name;
} else {
    document.getElementById('parentName').textContent = user.displayName || 'Parent';
    document.getElementById('studentName').textContent = user.childName || 'Student';
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
        <p class="insight-copy"><strong>Features:</strong> Grades, Attendance, Messages, Schedule, Homework, Tests, Notebooks, AI Progress.</p>
        <div class="insight-card">
            <div class="insight-top">
                <h5>What to try</h5>
            </div>
            <p class="insight-copy">Review attendance, grades, tests, and messages without affecting real data.</p>
        </div>
    `;
    hero.insertAdjacentElement('afterend', banner);
}

function insertDemoParentSections() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    const scheduleCard = document.createElement('div');
    scheduleCard.className = 'card';
    scheduleCard.innerHTML = `
        <h3>Schedule</h3>
        <p>Weekly timetable overview.</p>
        <button class="action-btn" onclick="document.getElementById('demoScheduleSection').scrollIntoView({ behavior: 'smooth' })">View Schedule</button>
    `;
    const homeworkCard = document.createElement('div');
    homeworkCard.className = 'card';
    homeworkCard.innerHTML = `
        <h3>Homework</h3>
        <p>Upcoming assignments and deadlines.</p>
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

let currentSubject = '';
let currentStudentEgn = '';
let currentPage = 1;
const MAX_PAGES = 20;

function showSection(sectionId) {
    ['aiProgressSection', 'notebooksSection', 'notebookViewer', 'attendanceSection'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === sectionId ? 'block' : 'none';
        }
    });
}

async function loadNotebooks() {
    try {
        showSection('notebooksSection');
        if (isDemo && demoData) {
            const section = document.getElementById('notebooksSection');
            const list = document.getElementById('notebooksList');
            section.style.display = 'block';
            list.innerHTML = '';

            demoData.notebooks.forEach(notebook => {
                const card = document.createElement('div');
                card.className = 'notebook-card';
                card.innerHTML = `
                    <div>
                        <h4>${notebook.subject}</h4>
                        <p>Demo notebook</p>
                    </div>
                    <button class="view-btn"
                        data-student="${demoData.student.name}"
                        data-subject="${notebook.subject}">
                        View
                    </button>
                `;
                list.appendChild(card);
            });

            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                viewNotebook(btn.dataset.student, btn.dataset.subject);
            });
            });
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/notebook/child?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const notebooks = await response.json();

        const uniqueNotebooks = [];
        const seen = new Set();
        notebooks.forEach(n => {
            const key = n.subject;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueNotebooks.push(n);
            }
        });

        const section = document.getElementById('notebooksSection');
        const list = document.getElementById('notebooksList');
        section.style.display = 'block';
        list.innerHTML = '';

        if (uniqueNotebooks.length === 0) {
            list.innerHTML = '<p>No notebooks found.</p>';
            return;
        }

        uniqueNotebooks.forEach(notebook => {
            const card = document.createElement('div');
            card.className = 'notebook-card';
            card.innerHTML = `
                <div>
                    <h4>${notebook.subject}</h4>
                    <p>Year: ${notebook.schoolYear}</p>
                </div>
                <button class="view-btn"
                    data-student="${user.childName || 'Student'}"
                    data-subject="${notebook.subject}">
                    View
                </button>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                viewNotebook(btn.dataset.student, btn.dataset.subject);
            });
        });

    } catch (error) {
        console.error('Could not load notebooks:', error);
    }
}

function viewNotebook(studentName, subject) {
    currentStudentEgn = studentName;
    currentSubject = subject;
    currentPage = 1;

    document.getElementById('notebooksSection').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'block';
    document.getElementById('notebookTitle').textContent = `${studentName || 'Student'} - ${subject}`;

    const wrapper = document.getElementById('notebookCanvasWrapper');
    const isMaths = subject.toLowerCase() === 'maths';
    wrapper.className = 'notebook-canvas-wrapper ' + (isMaths ? 'squared' : 'lined');

    updatePageControls();
    loadPage();
}

async function loadPage() {
    try {
        if (isDemo && demoData) {
            const img = document.getElementById('notebookImage');
            img.src = '';
            img.style.display = 'none';
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/notebook/student/name/${encodeURIComponent(currentStudentEgn)}/${encodeURIComponent(currentSubject)}/${currentPage}?t=${Date.now()}`, {
            headers: authHeaders()
        });
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

function changePage(direction) {
    currentPage += direction;
    updatePageControls();
    loadPage();
}

function updatePageControls() {
    document.getElementById('pageIndicator').textContent = `Page ${currentPage} / ${MAX_PAGES}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === MAX_PAGES;
}

function backToList() {
    document.getElementById('notebookViewer').style.display = 'none';
    document.getElementById('notebooksSection').style.display = 'block';
    currentPage = 1;
}

async function loadAttendance() {
    const section = document.getElementById('attendanceSection');
    const list = document.getElementById('attendanceList');
    showSection('attendanceSection');
    section.style.display = 'block';
    list.innerHTML = '';

    try {
        if (isDemo && demoData) {
            const records = demoData.attendance;
            list.innerHTML = records.map((record) => `
                <div class="attendance-card">
                    <div>
                        <h4>${record.date}</h4>
                        <p>Status recorded by school</p>
                    </div>
                    <span class="${String(record.status).toLowerCase() === 'present' ? 'present' : 'absent'}">${record.status}</span>
                </div>
            `).join('');
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/attendance/child?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const records = await response.json();

        if (!records.length) {
            list.innerHTML = '<p>No attendance records yet.</p>';
            return;
        }

        list.innerHTML = records.map((record) => `
            <div class="attendance-card">
                <div>
                    <h4>${record.date}</h4>
                    <p>Status recorded by school</p>
                </div>
                <span class="${String(record.status).toLowerCase() === 'present' ? 'present' : 'absent'}">${record.status}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Could not load attendance:', error);
        list.innerHTML = '<p>Attendance could not be loaded.</p>';
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

            const heroSummary = document.getElementById('parentAttendanceSummary');
            if (heroSummary) {
                heroSummary.textContent = total ? `${total} records, ${absent} absent` : 'No records yet';
            }

            document.getElementById('parentAttendanceTotal').textContent = total || '-';
            document.getElementById('parentAttendancePresent').textContent = total ? present : '-';
            document.getElementById('parentAttendanceAbsent').textContent = total ? absent : '-';
            document.getElementById('parentAttendanceLatest').textContent = latest ? latest.status : '-';
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/attendance/child?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const records = response.ok ? await response.json() : [];
        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT_UNEXCUSED' || r.status === 'ABSENT_EXCUSED').length;
        const total = records.length;
        const latest = records.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const heroSummary = document.getElementById('parentAttendanceSummary');
        if (heroSummary) {
            heroSummary.textContent = total ? `${total} records, ${absent} absent` : 'No records yet';
        }

        document.getElementById('parentAttendanceTotal').textContent = total || '-';
        document.getElementById('parentAttendancePresent').textContent = total ? present : '-';
        document.getElementById('parentAttendanceAbsent').textContent = total ? absent : '-';
        document.getElementById('parentAttendanceLatest').textContent = latest ? latest.status : '-';
    } catch (error) {
        console.error('Could not load attendance summary:', error);
    }
}

function renderTagList(elementId, values, emptyMessage) {
    const container = document.getElementById(elementId);
    if (!values || !values.length) {
        container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
        return;
    }

    container.innerHTML = values.map((value) => `<span class="insight-tag">${value}</span>`).join('');
}

function renderMetricCards(data) {
    const container = document.getElementById('parentAiOverview');
    const metrics = [
        { label: 'Accuracy', value: `${Number(data.accuracyRate || 0).toFixed(1)}%` },
        { label: 'Average Time', value: `${Math.round(data.averageTimeSpentSeconds || 0)}s` },
        { label: 'Average Attempts', value: Number(data.averageAttempts || 0).toFixed(1) },
        { label: 'Trend', value: String(data.progressTrend || 'UNKNOWN').replaceAll('_', ' ') },
        { label: 'Engagement', value: data.engagementLevel || 'UNKNOWN' },
        { label: 'Skipped Tasks', value: data.skippedTasks || 0 }
    ];

    container.innerHTML = metrics.map((metric) => `
        <div class="metric-card">
            <span class="metric-label">${metric.label}</span>
            <strong class="metric-value">${metric.value}</strong>
        </div>
    `).join('');
}

function renderParentActions(actions) {
    const container = document.getElementById('parentActions');
    if (!actions || !actions.length) {
        container.innerHTML = '<p class="empty-state">No actions suggested yet.</p>';
        return;
    }

    container.innerHTML = actions.map((action) => `<div class="insight-card"><p>${action}</p></div>`).join('');
}

function renderAttendanceSummary(attendance) {
    const container = document.getElementById('parentAttendanceSummary');
    if (!attendance) {
        container.innerHTML = '<p class="empty-state">No attendance summary available.</p>';
        return;
    }

    container.innerHTML = `
        <div class="insight-card">
            <p><strong>Total records:</strong> ${attendance.totalRecords}</p>
            <p><strong>Present:</strong> ${attendance.presentCount}</p>
            <p><strong>Absent:</strong> ${attendance.absentCount}</p>
            <p><strong>Latest status:</strong> ${attendance.latestStatus}</p>
        </div>
    `;
}

async function loadAiProgress() {
    try {
        if (isDemo) {
            showSection('aiProgressSection');
            renderMetricCards({
                accuracyRate: 82,
                averageTimeSpentSeconds: 65,
                averageAttempts: 1.7,
                progressTrend: 'IMPROVING',
                engagementLevel: 'HIGH',
                skippedTasks: 1
            });
            renderTagList('parentWeakSubjects', ['Quadratic factoring'], 'No weak subjects flagged yet.');
            renderTagList('parentStrengths', ['Vocabulary', 'Lab precision'], 'No strengths identified yet.');
            renderParentActions([
                'Review the algebra recap video together.',
                'Encourage regular practice on weeknights.'
            ]);
            renderAttendanceSummary({
                totalRecords: demoData.attendance.length,
                presentCount: demoData.attendance.filter(r => r.status === 'PRESENT').length,
                absentCount: demoData.attendance.filter(r => r.status !== 'PRESENT').length,
                latestStatus: demoData.attendance[0]?.status || '-'
            });
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/ai/parent/me?t=${Date.now()}`, {
            headers: authHeaders()
        });
        if (!response.ok) {
            throw new Error(`AI progress request failed with status ${response.status}`);
        }

        const data = await response.json();
        showSection('aiProgressSection');
        renderMetricCards(data);
        renderTagList('parentWeakSubjects', data.weakSubjects, 'No weak subjects flagged yet.');
        renderTagList('parentStrengths', data.strengths, 'No strengths identified yet.');
        renderParentActions(data.parentActions);
        renderAttendanceSummary(data.attendance);
    } catch (error) {
        console.error('Could not load AI progress:', error);
        showSection('aiProgressSection');
        document.getElementById('parentAiOverview').innerHTML = '';
        document.getElementById('parentWeakSubjects').innerHTML = '<p class="empty-state">AI progress could not be loaded.</p>';
        document.getElementById('parentStrengths').innerHTML = '';
        document.getElementById('parentActions').innerHTML = '';
        document.getElementById('parentAttendanceSummary').innerHTML = '';
    }
}

if (!isDemo) {
    socket.on('attendance-updated', (data) => {
        if (data?.studentName && data.studentName === (user.childName || '')) {
            loadAttendanceSummary();
        }
    });
}

loadAttendanceSummary();
loadParentGrades();
loadParentNotifications();

async function loadTestResults() {
    const list = document.getElementById('parentTestsList');
    if (!list) return;
    list.innerHTML = '<p class="empty-state">Loading tests...</p>';

    try {
        if (isDemo && demoData) {
            const results = demoData.tests;
            if (!results.length) {
                list.innerHTML = '<p class="empty-state">No test results yet.</p>';
                return;
            }
            list.innerHTML = results.map(result => `
                <div class="test-card">
                    <h5>${result.title}</h5>
                    <div class="test-meta">Status: ${result.status || 'SUBMITTED'}</div>
                    ${result.score !== null && result.score !== undefined ? `<div class="test-meta">Score: ${result.score}</div>` : ''}
                    ${result.feedback ? `<div class="test-meta">Feedback: ${result.feedback}</div>` : ''}
                    <div class="test-meta">Due: ${result.dueDate || '-'}</div>
                </div>
            `).join('');
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/tests/results/me?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const results = response.ok ? await response.json() : [];
        if (!results.length) {
            list.innerHTML = '<p class="empty-state">No test results yet.</p>';
            return;
        }

        list.innerHTML = results.map(result => `
            <div class="test-card">
                <h5>Test #${result.testId}</h5>
                <div class="test-meta">Status: ${result.status || 'SUBMITTED'}</div>
                ${result.score !== null && result.score !== undefined ? `<div class="test-meta">Score: ${result.score}</div>` : ''}
                ${result.feedback ? `<div class="test-meta">Feedback: ${result.feedback}</div>` : ''}
                <div class="test-meta">Submitted: ${result.submittedAt || '-'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Could not load test results:', error);
        list.innerHTML = '<p class="empty-state">Failed to load test results.</p>';
    }
}

if (!isDemo) {
    socket.on('test-graded', (data) => {
        if (data?.studentName && data.studentName === (user.childName || '')) {
            loadTestResults();
        }
    });
}

loadTestResults();

if (!isDemo) {
    socket.on('grade-updated', (data) => {
        if (data?.studentName && data.studentName === (user.childName || '')) {
            loadParentGrades();
            loadParentNotifications();
        }
    });
}

async function loadParentGrades() {
    const list = document.getElementById('parentGradesList');
    const averages = document.getElementById('parentAverages');
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
        const [gradesRes, avgRes] = await Promise.all([
            fetch(`${BACKEND_BASE_URL}/api/grades/student/me?t=${Date.now()}`, { headers: authHeaders() }),
            fetch(`${BACKEND_BASE_URL}/api/grades/student/me/averages?t=${Date.now()}`, { headers: authHeaders() })
        ]);
        const grades = gradesRes.ok ? await gradesRes.json() : [];
        const avg = avgRes.ok ? await avgRes.json() : {};

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
    } catch (error) {
        console.error('Could not load grades:', error);
        list.innerHTML = '<p class="empty-state">Failed to load grades.</p>';
    }
}

async function loadParentNotifications() {
    const container = document.getElementById('parentNotifications');
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
        const res = await fetch(`${BACKEND_BASE_URL}/api/notifications/me?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const notifications = res.ok ? await res.json() : [];
        if (!notifications.length) {
            container.innerHTML = '<p class="empty-state">No notifications yet.</p>';
            return;
        }
        container.innerHTML = notifications.slice(0, 6).map(n => `
            <div class="insight-card">
                <div class="insight-top">
                    <h5>${n.type}</h5>
                    <span class="metric-label">${(n.createdAt || '').replace('T', ' ')}</span>
                </div>
                <p class="insight-copy">${n.message}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Could not load notifications:', error);
    }
}
