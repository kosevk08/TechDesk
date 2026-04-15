const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io('https://techdesk-frontend.onrender.com');
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);
let teacherLang = localStorage.getItem('teacherLang') || 'en';
let studentNames = [];
let gradeAutosaveTimer = null;
let lastGradeHash = null;
let testAutosaveTimer = null;
let lastTestHash = null;

function deriveDisplayNameFromEmail(email, fallback = 'Teacher') {
    if (!email) return fallback;
    const local = String(email).split('@')[0] || '';
    const cleaned = local
        .replace(/[-_.]+/g, ' ')
        .replace(/\b(student|teacher|parent|admin)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned) return fallback;
    return cleaned
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function resolveTeacherDisplayName(profile) {
    if (!profile) return 'Teacher';
    const firstName = String(profile.firstName || '').trim();
    const lastName = String(profile.lastName || '').trim();
    const fullFromNames = `${firstName} ${lastName}`.trim();
    return (
        fullFromNames ||
        String(profile.displayName || '').trim() ||
        String(profile.fullName || '').trim() ||
        String(profile.name || '').trim() ||
        deriveDisplayNameFromEmail(profile.email, 'Teacher')
    );
}

function authHeaders(extra = {}) {
    const headers = token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.egn) headers['X-User-Egn'] = user.egn;
    return headers;
}

if (!user || user.role !== 'TEACHER') {
    window.location.href = '/';
}
if (isDemo) {
    insertDemoBanner();
    insertDemoTeacherSections();
}

if (isDemo && demoData) {
    document.getElementById('teacherName').textContent = demoData.teacher.name;
} else {
    document.getElementById('teacherName').textContent = resolveTeacherDisplayName(user);
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

let currentViewStudent = null;
let currentViewStudentEgn = null;
let currentViewSubject = null;
let currentViewPage = 1;
let currentViewMaxPage = 1;
let currentNotebookStyle = 'lined';
const teacherCanvas = document.getElementById('teacherCanvas');
const tCtx = teacherCanvas.getContext('2d');
const aiStatusText = document.getElementById('aiStatusText');
const aiStatusBanner = document.getElementById('aiStatusBanner');
let teacherTool = 'pen';
let teacherDrawing = false;
let teacherLastX = 0;
let teacherLastY = 0;
let teacherAutosaveTimer = null;
const liveActivityMap = new Map();
const studentPresenceMap = new Map();

function setTeacherTool(tool) {
    teacherTool = 'pen';
    document.getElementById('teacherPenBtn')?.classList.add('active');
}

function setClassroomControlStatus(text) {
    const status = document.getElementById('classroomControlStatus');
    if (status) status.textContent = text;
}

function renderStudentPresence() {
    const list = document.getElementById('studentPresenceList');
    if (!list) return;
    const items = Array.from(studentPresenceMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    if (!items.length) {
        list.innerHTML = '<p class="empty-state">No live status yet.</p>';
        return;
    }
    list.innerHTML = items.map((item) => `
        <div class="presence-item">
            <strong>${item.studentName || 'Student'}</strong>
            <span class="presence-pill ${item.state === 'active' ? 'active' : 'inactive'}">${item.state === 'active' ? 'Active' : 'Inactive'}</span>
        </div>
    `).join('');
}

function lockClassroom() {
    const className = user?.className || null;
    socket.emit('classroom-lock', {
        className,
        message: 'Teacher presentation mode is active. Please stay focused on this page.'
    });
    setClassroomControlStatus('Screens locked.');
}

function unlockClassroom() {
    const className = user?.className || null;
    socket.emit('classroom-unlock', { className });
    setClassroomControlStatus('Screens unlocked.');
}

function syncClassroomPanel(panel) {
    const allowed = ['home', 'subjects', 'schedule', 'homework', 'practice', 'attendance', 'grades', 'tests', 'notifications'];
    const target = allowed.includes(panel) ? panel : 'subjects';
    const className = user?.className || null;
    socket.emit('classroom-sync-page', { className, panel: target });
    setClassroomControlStatus(`Synced panel: ${target}`);
}

function setNotebookVisualStyle(style) {
    currentNotebookStyle = ['lined', 'squared', 'dotted'].includes(style) ? style : 'lined';
    const wrapper = document.getElementById('notebookCanvasWrapper');
    if (wrapper) wrapper.className = `notebook-canvas-wrapper ${currentNotebookStyle}`;
}

function updateTeacherPageControls() {
    document.getElementById('teacherPageIndicator').textContent = `Page ${currentViewPage} / ${currentViewMaxPage}`;
    document.getElementById('teacherPrevBtn').disabled = currentViewPage <= 1;
    document.getElementById('teacherNextBtn').disabled = currentViewPage >= currentViewMaxPage;
}

async function loadTeacherPagesMeta() {
    if (isDemo || !currentViewSubject) {
        currentViewMaxPage = 1;
        updateTeacherPageControls();
        return;
    }
    try {
        const url = currentViewStudentEgn
            ? `${BACKEND_BASE_URL}/api/notebook/pages/${encodeURIComponent(currentViewStudentEgn)}/${encodeURIComponent(currentViewSubject)}`
            : `${BACKEND_BASE_URL}/api/notebook/student/name/pages/${encodeURIComponent(currentViewStudent)}/${encodeURIComponent(currentViewSubject)}`;
        const res = await fetch(url, { headers: authHeaders() });
        const pages = res.ok ? await res.json() : [];
        currentViewMaxPage = Math.max(1, ...(pages || [1]));
    } catch {
        currentViewMaxPage = 1;
    }
    updateTeacherPageControls();
}

async function changeTeacherPage(direction) {
    const target = currentViewPage + direction;
    if (target < 1 || target > currentViewMaxPage) return;
    currentViewPage = target;
    updateTeacherPageControls();
    document.getElementById('notebookTitle').textContent =
        `${currentViewStudent} - ${currentViewSubject} (Page ${currentViewPage})`;
    tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
    await loadTeacherPage();
}

async function assignNotebookStyle() {
    if (!currentViewStudentEgn || !currentViewSubject || isDemo) return;
    const style = document.getElementById('notebookStyleSelect')?.value || 'lined';
    try {
        await fetch(`${BACKEND_BASE_URL}/api/notebook/settings`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                studentEgn: currentViewStudentEgn,
                subject: currentViewSubject,
                style
            })
        });
        setNotebookVisualStyle(style);
    } catch (error) {
        console.error('Could not assign style:', error);
    }
}

function drawTeacher(x0, y0, x1, y1) {
    if (!currentViewStudent || !currentViewSubject) return;
    const size = document.getElementById('teacherSize')?.value || 3;
    tCtx.beginPath();
    tCtx.moveTo(x0, y0);
    tCtx.lineTo(x1, y1);
    tCtx.strokeStyle = '#e53e3e';
    tCtx.lineWidth = size;
    tCtx.lineCap = 'round';
    tCtx.lineJoin = 'round';
    tCtx.stroke();
    socket.emit('draw-stroke', {
        x0, y0, x1, y1,
        color: '#e53e3e',
        size,
        tool: 'pen',
        studentName: currentViewStudent,
        subject: currentViewSubject,
        page: currentViewPage,
        authorRole: 'TEACHER'
    });
    scheduleTeacherSave();
}

function scheduleTeacherSave() {
    if (teacherAutosaveTimer) clearTimeout(teacherAutosaveTimer);
    teacherAutosaveTimer = setTimeout(() => saveTeacherOverlay(), 600);
}

async function saveTeacherOverlay() {
    if (!currentViewStudentEgn || !currentViewSubject || isDemo) return;
    const baseImg = document.getElementById('notebookImage');
    const merged = document.createElement('canvas');
    merged.width = teacherCanvas.width;
    merged.height = teacherCanvas.height;
    const mtx = merged.getContext('2d');
    if (baseImg && baseImg.src) {
        await new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                mtx.drawImage(img, 0, 0, merged.width, merged.height);
                resolve();
            };
            img.onerror = resolve;
            img.src = baseImg.src;
        });
    }
    mtx.drawImage(teacherCanvas, 0, 0, merged.width, merged.height);
    try {
        await fetch(`${BACKEND_BASE_URL}/api/notebook/save`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                studentEgn: currentViewStudentEgn,
                subject: currentViewSubject,
                schoolYear: '2025-2026',
                format: 'A4',
                style: currentNotebookStyle,
                color: '#e53e3e',
                content: merged.toDataURL(),
                pageNumber: currentViewPage
            })
        });
    } catch (error) {
        console.error('Could not save teacher notes:', error);
    }
}

function showSection(sectionId) {
    ['aiInsightsSection', 'notebooksSection', 'notebookViewer', 'testsSection', 'gradesSection'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === sectionId ? 'block' : 'none';
        }
    });
}

function subjectMatch(a, b) {
    return a && b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

function markLiveActivity(studentName, subject, page, role = 'STUDENT') {
    if (!studentName || !subject) return;
    const key = `${studentName}__${subject}`;
    liveActivityMap.set(key, {
        studentName,
        subject,
        page: Number(page || 1),
        role,
        updatedAt: Date.now()
    });
    renderLiveActivity();
}

function renderLiveActivity() {
    const container = document.getElementById('liveActivityList');
    if (!container) return;
    const now = Date.now();
    const items = Array.from(liveActivityMap.values())
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 12);

    if (!items.length) {
        container.innerHTML = '<p class="empty-state">No live writing activity yet.</p>';
        return;
    }

    container.innerHTML = items.map(item => {
        const seconds = Math.floor((now - item.updatedAt) / 1000);
        const isLive = seconds <= 15;
        return `
            <div class="live-activity-item">
                <div>
                    <strong>${item.studentName}</strong>
                    <div class="live-activity-meta">${item.subject} • Page ${item.page} • ${item.role}</div>
                    <div class="live-activity-meta">Last update: ${seconds}s ago</div>
                </div>
                <span class="live-pill ${isLive ? 'live' : 'idle'}">${isLive ? 'Writing now' : 'Idle'}</span>
            </div>
        `;
    }).join('');
}

socket.on('draw-stroke', (data) => {
    markLiveActivity(data?.studentName, data?.subject, data?.page, data?.authorRole || 'STUDENT');
    if (data.studentName === currentViewStudent &&
        subjectMatch(data.subject, currentViewSubject) &&
        parseInt(data.page) === parseInt(currentViewPage)) {
        document.getElementById('liveBadge').style.display = 'inline';
        tCtx.beginPath();
        tCtx.moveTo(data.x0, data.y0);
        tCtx.lineTo(data.x1, data.y1);
        tCtx.strokeStyle = data.color || '#1a56db';
        tCtx.lineWidth = data.size || 2;
        tCtx.lineCap = 'round';
        tCtx.stroke();
    }
});

socket.on('page-change', (data) => {
    markLiveActivity(data?.studentName, data?.subject, data?.page, data?.authorRole || 'STUDENT');
    if (data.studentName === currentViewStudent && subjectMatch(data.subject, currentViewSubject)) {
        currentViewPage = data.page;
        currentViewMaxPage = Math.max(currentViewMaxPage, currentViewPage);
        updateTeacherPageControls();
        document.getElementById('notebookTitle').textContent =
            `${currentViewStudent} - ${currentViewSubject} (Page ${currentViewPage})`;
        tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
        loadTeacherPage();
    }
});

socket.on('student-presence', (data) => {
    if (!data?.studentName) return;
    studentPresenceMap.set(data.studentName, {
        studentName: data.studentName,
        className: data.className || null,
        state: data.state === 'inactive' ? 'inactive' : 'active',
        updatedAt: data.updatedAt || Date.now()
    });
    renderStudentPresence();
});

async function loadNotifications() {
    const container = document.getElementById('teacherNotifications');
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

async function loadStudentNames() {
    if (isDemo && demoData) {
        studentNames = [{ fullName: demoData.student.name, className: demoData.student.className }];
        return;
    }
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/student/names`, {
            headers: authHeaders()
        });
        studentNames = res.ok ? await res.json() : [];
    } catch (error) {
        console.error('Could not load student names:', error);
        studentNames = [];
    }
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
        return false;
    }

    try {
        setGradeStatus('Saving grade...');
        if (isDemo && demoData) {
            demoData.grades.unshift({
                subject,
                value,
                comment: comment || 'Demo grade saved.',
                createdAt: new Date().toISOString()
            });
            demoData.notifications.unshift({
                type: 'Grade Update',
                message: `${subject} grade added: ${value}`,
                createdAt: new Date().toISOString()
            });
            setGradeStatus('Grade saved (demo).');
            document.getElementById('gradeValue').value = '';
            document.getElementById('gradeComment').value = '';
            loadGradeHistory();
            loadNotifications();
            return true;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/grades`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                studentName,
                subject,
                value,
                comment
            })
        });
        if (!res.ok) throw new Error(`Grade failed ${res.status}`);
        await res.json();
        setGradeStatus('Grade saved.');
        document.getElementById('gradeValue').value = '';
        document.getElementById('gradeComment').value = '';
        loadGradeHistory();
        loadNotifications();
        socket.emit('grade-updated', { studentName });
        return true;
    } catch (error) {
        console.error('Could not save grade:', error);
        setGradeStatus('Failed to save grade.');
        return false;
    }
}

function scheduleGradeAutosave() {
    if (gradeAutosaveTimer) clearTimeout(gradeAutosaveTimer);
    gradeAutosaveTimer = setTimeout(async () => {
        const studentName = document.getElementById('gradeStudent').value;
        const subject = document.getElementById('gradeSubject').value.trim();
        const value = document.getElementById('gradeValue').value.trim();
        if (!studentName || !subject || !value) return;
        const hash = `${studentName}|${subject}|${value}|${document.getElementById('gradeComment').value.trim()}`;
        if (hash === lastGradeHash) return;
        setGradeStatus('Autosaving...');
        const success = await addGrade();
        if (success) lastGradeHash = hash;
    }, 900);
}

async function loadGradeHistory() {
    const studentName = document.getElementById('gradeStudent').value;
    const container = document.getElementById('gradeHistoryList');
    if (!container || !studentName) return;
    container.innerHTML = '<p class="empty-state">Loading...</p>';
    try {
        if (isDemo && demoData) {
            const grades = demoData.grades;
            renderTeacherGradeHistory(container, grades);
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/grades/student/name/${encodeURIComponent(studentName)}?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const grades = res.ok ? await res.json() : [];
        renderTeacherGradeHistory(container, grades);
    } catch (error) {
        console.error('Could not load grades:', error);
        container.innerHTML = '<p class="empty-state">Failed to load grades.</p>';
    }
}

function gradeToneClass(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 'is-mid';
    if (numeric >= 5.5) return 'is-top';
    if (numeric >= 4.5) return 'is-good';
    if (numeric >= 3.5) return 'is-mid';
    return 'is-risk';
}

function gradeDateLabel(raw) {
    if (!raw) return '-';
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return String(raw).replace('T', ' ');
}

function renderTeacherGradeHistory(container, grades) {
    if (!Array.isArray(grades) || !grades.length) {
        const filter = document.getElementById('gradeFilterSubject');
        if (filter) filter.innerHTML = '<option value="">All subjects</option>';
        container.innerHTML = '<p class="empty-state">No grades yet.</p>';
        return;
    }

    let safeGrades = grades
        .map((g) => ({
            subject: g.subject || 'Subject',
            value: Number(g.value),
            comment: g.comment || '',
            createdAt: g.createdAt || null
        }))
        .filter((g) => Number.isFinite(g.value))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const filter = document.getElementById('gradeFilterSubject');
    const subjectOptions = Array.from(new Set(safeGrades.map((g) => g.subject))).sort((a, b) => a.localeCompare(b));
    if (filter) {
        const current = filter.value || '';
        filter.innerHTML = `<option value="">All subjects</option>${subjectOptions.map((s) => `<option value="${s}">${s}</option>`).join('')}`;
        if (current && subjectOptions.includes(current)) filter.value = current;
        if (filter.value) safeGrades = safeGrades.filter((g) => g.subject === filter.value);
    }

    if (!safeGrades.length) {
        container.innerHTML = '<p class="empty-state">No grades for this subject yet.</p>';
        return;
    }

    const overall = safeGrades.reduce((sum, g) => sum + g.value, 0) / Math.max(safeGrades.length, 1);
    const bySubject = safeGrades.reduce((acc, g) => {
        if (!acc[g.subject]) acc[g.subject] = [];
        acc[g.subject].push(g.value);
        return acc;
    }, {});
    const strongest = Object.entries(bySubject)
        .map(([subject, values]) => ({ subject, avg: values.reduce((s, v) => s + v, 0) / values.length }))
        .sort((a, b) => b.avg - a.avg)[0];

    container.innerHTML = `
        <div class="gradebook-stats teacher-grade-stats">
            <article class="grade-stat-card">
                <span>Total Entries</span>
                <strong>${safeGrades.length}</strong>
            </article>
            <article class="grade-stat-card">
                <span>Student Average</span>
                <strong class="${gradeToneClass(overall)}">${overall.toFixed(2)}</strong>
            </article>
            <article class="grade-stat-card">
                <span>Strongest Subject</span>
                <strong>${strongest ? strongest.subject : '-'}</strong>
            </article>
        </div>
        <div class="gradebook-table-wrap">
            <table class="gradebook-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    ${safeGrades.map((g) => `
                        <tr>
                            <td>${gradeDateLabel(g.createdAt)}</td>
                            <td>${g.subject}</td>
                            <td><strong class="grade-pill ${gradeToneClass(g.value)}">${g.value.toFixed(2)}</strong></td>
                            <td>${g.comment || '<span class="empty-inline">No comment</span>'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadGrades() {
    showSection('gradesSection');
    await loadStudentNames();
    populateGradeStudents();
    await loadGradeHistory();
}

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'gradeStudent') {
        loadGradeHistory();
    }
});

document.addEventListener('input', (e) => {
    if (!e.target) return;
    const autosaveIds = new Set(['gradeStudent', 'gradeSubject', 'gradeValue', 'gradeComment']);
    if (autosaveIds.has(e.target.id)) {
        scheduleGradeAutosave();
    }
});

document.addEventListener('input', (e) => {
    if (!e.target) return;
    const autosaveIds = new Set([
        'testTitle',
        'testSubject',
        'testDescription',
        'testQuestions',
        'testPoints',
        'testDueDate'
    ]);
    if (autosaveIds.has(e.target.id)) {
        scheduleTestAutosave();
    }
});

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'testClass') {
        scheduleTestAutosave();
    }
});

if (!isDemo) {
    socket.on('grade-updated', () => {
        if (document.getElementById('gradesSection')?.style.display === 'block') {
            loadGradeHistory();
        }
        loadNotifications();
    });
}

loadNotifications();
attachTeacherCanvasEvents();
setInterval(renderLiveActivity, 3000);

async function loadTeacherPage() {
    try {
        if (isDemo && demoData) {
            const notebook = demoData.notebooks.find(n => n.studentName === currentViewStudent && subjectMatch(n.subject, currentViewSubject))
                || demoData.notebooks[0];
            renderDemoNotebookPage(notebook);
            return;
        }
        const styleRes = await fetch(`${BACKEND_BASE_URL}/api/notebook/settings/name/${encodeURIComponent(currentViewStudent)}/${encodeURIComponent(currentViewSubject)}`, {
            headers: authHeaders()
        });
        const stylePayload = styleRes.ok ? await styleRes.json() : { style: 'lined' };
        setNotebookVisualStyle(stylePayload.style || 'lined');
        const styleSelect = document.getElementById('notebookStyleSelect');
        if (styleSelect) styleSelect.value = currentNotebookStyle;

        const pageUrl = currentViewStudentEgn
            ? `${BACKEND_BASE_URL}/api/notebook/student/${encodeURIComponent(currentViewStudentEgn)}/${encodeURIComponent(currentViewSubject)}/${currentViewPage}?t=${Date.now()}`
            : `${BACKEND_BASE_URL}/api/notebook/student/name/${encodeURIComponent(currentViewStudent)}/${encodeURIComponent(currentViewSubject)}/${currentViewPage}?t=${Date.now()}`;
        const res = await fetch(pageUrl, { headers: authHeaders() });
        const img = document.getElementById('notebookImage');
        tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
        if (res.ok) {
            const notebook = await res.json();
            if (notebook?.style) {
                setNotebookVisualStyle(notebook.style);
                if (styleSelect) styleSelect.value = notebook.style;
            }
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

function formatNotebookUpdated(value) {
    if (!value) return 'No activity yet';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Updated recently';
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function avatarInitials(name) {
    const parts = String(name || 'Student').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'ST';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

async function loadNotebooks() {
    try {
        // Always open notebooks list first, never auto-open a specific notebook.
        document.body.classList.remove('notebook-focus');
        currentViewStudent = null;
        currentViewStudentEgn = null;
        currentViewSubject = null;
        currentViewPage = 1;
        currentViewMaxPage = 1;
        document.getElementById('notebookViewer').style.display = 'none';

        if (isDemo && demoData) {
            const section = document.getElementById('notebooksSection');
            const list = document.getElementById('notebooksList');
            showSection('notebooksSection');
            section.style.display = 'block';
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            list.innerHTML = '';

            const notebookByStudentSubject = new Map();
            demoData.notebooks.forEach(notebook => {
                const key = `${notebook.studentName}__${notebook.subject}`;
                if (!notebookByStudentSubject.has(key) || (notebook.page || 1) > (notebookByStudentSubject.get(key).page || 1)) {
                    notebookByStudentSubject.set(key, notebook);
                }
            });
            const demoCards = Array.from(notebookByStudentSubject.values());
            list.className = 'notebook-grid';

            demoCards.forEach(notebook => {
                const card = document.createElement('div');
                card.className = 'notebook-card';
                card.innerHTML = `
                    <div class="notebook-card-head">
                        <span class="notebook-avatar">${avatarInitials(notebook.studentName)}</span>
                        <div>
                            <h4>${notebook.studentName}</h4>
                            <p class="notebook-subject">${notebook.subject}</p>
                        </div>
                    </div>
                    <div class="notebook-meta">
                        <span class="notebook-chip">Demo</span>
                        <span class="notebook-chip">Page ${notebook.page || 1}</span>
                    </div>
                    <button class="view-btn"
                        data-student="${notebook.studentName}"
                        data-subject="${notebook.subject}">
                        Open Notebook
                    </button>
                `;
                list.appendChild(card);
            });

            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    viewNotebook(null, null, btn.dataset.student, btn.dataset.subject);
                });
            });
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/notebook/teacher?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const notebooks = await response.json();

        const uniqueNotebooks = [];
        const seen = new Set();
        notebooks.forEach(n => {
            const key = `${n.studentName}-${n.subject}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueNotebooks.push(n);
            }
        });

        const section = document.getElementById('notebooksSection');
        const list = document.getElementById('notebooksList');
        showSection('notebooksSection');
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        list.className = 'notebook-grid';
        list.innerHTML = '';

        if (uniqueNotebooks.length === 0) {
            list.innerHTML = '<p>No notebooks found.</p>';
            return;
        }

        uniqueNotebooks.forEach(notebook => {
            const studentName = notebook.studentName || 'Student';
            const card = document.createElement('div');
            card.className = 'notebook-card';
            card.innerHTML = `
                <div class="notebook-card-head">
                    <span class="notebook-avatar">${avatarInitials(studentName)}</span>
                    <div>
                        <h4>${studentName}</h4>
                        <p class="notebook-subject">${notebook.subject}</p>
                    </div>
                </div>
                <div class="notebook-meta">
                    <span class="notebook-chip">${notebook.schoolYear || 'N/A'}</span>
                    <span class="notebook-chip">${formatNotebookUpdated(notebook.lastUpdated)}</span>
                </div>
                <button class="view-btn"
                    data-id="${notebook.id}"
                    data-egn="${notebook.studentEgn || ''}"
                    data-student="${studentName}"
                    data-subject="${notebook.subject}">
                    Open Notebook
                </button>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                viewNotebook(btn.dataset.id, btn.dataset.egn, btn.dataset.student, btn.dataset.subject);
            });
        });

    } catch (error) {
        console.error('Could not load notebooks:', error);
    }
}

function viewNotebook(id, studentEgn, studentName, subject) {
    document.body.classList.add('notebook-focus');
    currentViewStudent = studentName;
    currentViewStudentEgn = studentEgn || null;
    currentViewSubject = subject;
    currentViewPage = 1;

    document.getElementById('notebooksSection').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'block';
    document.getElementById('notebookTitle').textContent = `${studentName} - ${subject} (Page 1)`;
    document.getElementById('liveBadge').style.display = 'none';

    const wrapper = document.getElementById('notebookCanvasWrapper');
    wrapper.className = 'notebook-canvas-wrapper lined';

    teacherCanvas.width = wrapper.clientWidth;
    teacherCanvas.height = wrapper.clientHeight;
    tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);

    loadTeacherPagesMeta().then(loadTeacherPage);
}

function backToList() {
    document.body.classList.remove('notebook-focus');
    currentViewStudent = null;
    currentViewStudentEgn = null;
    currentViewSubject = null;
    currentViewPage = 1;
    currentViewMaxPage = 1;
    document.getElementById('liveBadge').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'none';
    document.getElementById('notebooksSection').style.display = 'block';
}

function attachTeacherCanvasEvents() {
    if (!teacherCanvas) return;
    teacherCanvas.addEventListener('mousedown', (event) => {
        if (!currentViewStudent) return;
        teacherDrawing = true;
        [teacherLastX, teacherLastY] = [event.offsetX, event.offsetY];
    });

    teacherCanvas.addEventListener('mousemove', (event) => {
        if (!teacherDrawing) return;
        drawTeacher(teacherLastX, teacherLastY, event.offsetX, event.offsetY);
        [teacherLastX, teacherLastY] = [event.offsetX, event.offsetY];
    });

    teacherCanvas.addEventListener('mouseup', () => { teacherDrawing = false; });
    teacherCanvas.addEventListener('mouseout', () => { teacherDrawing = false; });

    teacherCanvas.addEventListener('touchstart', (event) => {
        if (!currentViewStudent) return;
        event.preventDefault();
        const touch = event.touches[0];
        const rect = teacherCanvas.getBoundingClientRect();
        teacherDrawing = true;
        teacherLastX = touch.clientX - rect.left;
        teacherLastY = touch.clientY - rect.top;
    }, { passive: false });

    teacherCanvas.addEventListener('touchmove', (event) => {
        if (!teacherDrawing) return;
        event.preventDefault();
        const touch = event.touches[0];
        const rect = teacherCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        drawTeacher(teacherLastX, teacherLastY, x, y);
        [teacherLastX, teacherLastY] = [x, y];
    }, { passive: false });

    teacherCanvas.addEventListener('touchend', () => { teacherDrawing = false; });
    teacherCanvas.addEventListener('touchcancel', () => { teacherDrawing = false; });
}

function formatPercent(value) {
    return `${Number(value || 0).toFixed(1)}%`;
}

function formatSeconds(value) {
    return `${Math.round(value || 0)}s`;
}

function riskBadgeClass(level) {
    return `risk-badge risk-${String(level || 'low').toLowerCase()}`;
}

function setAiStatus(message, type = 'info') {
    aiStatusText.textContent = message;

    if (!message) {
        aiStatusBanner.style.display = 'none';
        aiStatusBanner.textContent = '';
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

    grid.innerHTML = metrics.map((metric) => `
        <div class="metric-card">
            <span class="metric-label">${metric.label}</span>
            <strong class="metric-value">${metric.value}</strong>
        </div>
    `).join('');
}

function renderStudents(students) {
    const container = document.getElementById('aiStudentsList');

    if (!students || students.length === 0) {
        container.innerHTML = '<p class="empty-state">No students currently flagged for attention.</p>';
        return;
    }

    container.innerHTML = students.map((student) => `
        <div class="insight-card">
            <div class="insight-top">
                <div>
                    <h5>${student.studentName}</h5>
                    <p>${student.className} • ${student.adaptiveRecommendation.replaceAll('_', ' ')}</p>
                </div>
                <span class="${riskBadgeClass(student.riskLevel)}">${student.riskLevel}</span>
            </div>
            <div class="insight-stats">
                <span>Accuracy ${formatPercent(student.accuracyRate)}</span>
                <span>Time ${formatSeconds(student.averageTimeSpentSeconds)}</span>
                <span>Attempts ${Number(student.averageAttempts || 0).toFixed(1)}</span>
            </div>
            <p class="insight-copy">${student.recommendedAction}</p>
            <p class="insight-weaknesses"><strong>Weakness areas:</strong> ${(student.weaknessAreas || []).join(', ') || 'No clear pattern yet'}</p>
        </div>
    `).join('');
}

function renderAlerts(alerts) {
    const container = document.getElementById('aiAlertsList');

    if (!alerts || alerts.length === 0) {
        container.innerHTML = '<p class="empty-state">No active alerts right now.</p>';
        return;
    }

    container.innerHTML = alerts.map((alert) => `
        <div class="alert-card alert-${String(alert.severity || 'medium').toLowerCase()}">
            <div class="insight-top">
                <h5>${alert.title}</h5>
                <span class="${riskBadgeClass(alert.severity)}">${alert.severity}</span>
            </div>
            <p class="insight-copy">${alert.message}</p>
        </div>
    `).join('');
}

function renderTopics(topics) {
    const container = document.getElementById('aiTopicsList');

    if (!topics || topics.length === 0) {
        container.innerHTML = '<p class="empty-state">No topic analytics available yet.</p>';
        return;
    }

    container.innerHTML = topics.map((topic) => `
        <div class="topic-row">
            <div>
                <h5>${topic.label}</h5>
                <p>${topic.subject}</p>
            </div>
            <div class="topic-metrics">
                <span>${formatPercent(topic.accuracyRate)} accuracy</span>
                <span>${formatSeconds(topic.averageTimeSpentSeconds)} avg time</span>
                <span>${Number(topic.averageAttempts || 0).toFixed(1)} attempts</span>
                <span class="${riskBadgeClass(topic.difficultyLevel)}">${topic.difficultyLevel}</span>
            </div>
            <p class="insight-copy">${topic.teacherAction}</p>
        </div>
    `).join('');
}

async function loadAiInsights() {
    try {
        if (isDemo) {
            showSection('aiInsightsSection');
            renderOverview({
                totalTasks: 42,
                accuracyRate: 0.82,
                averageTimeSpentSeconds: 64,
                averageAttempts: 1.6,
                strugglingStudentsCount: 1,
                attentionAlertsCount: 2
            });
            renderStudents([
                {
                    studentName: demoData.student.name,
                    className: demoData.student.className,
                    adaptiveRecommendation: 'FOCUS_REVIEW',
                    riskLevel: 'medium',
                    accuracyRate: 0.68,
                    averageTimeSpentSeconds: 85,
                    averageAttempts: 2.1,
                    recommendedAction: 'Schedule a quick recap on factoring.',
                    weaknessAreas: ['Quadratic factoring', 'Word problems']
                }
            ]);
            renderAlerts([
                {
                    title: 'Physics Momentum',
                    severity: 'medium',
                    message: 'Several students spend extra time on momentum problems.'
                }
            ]);
            renderTopics([
                {
                    label: 'Quadratic Equations',
                    subject: 'Maths',
                    accuracyRate: 0.72,
                    averageTimeSpentSeconds: 88,
                    averageAttempts: 2.4,
                    difficultyLevel: 'medium',
                    teacherAction: 'Re-teach factoring with a short guided example.'
                }
            ]);
            setAiStatus('Demo AI data loaded for exploration.');
            return;
        }
        setAiStatus('Loading live classroom signals from the AI engine...');
        const response = await fetch(`${BACKEND_BASE_URL}/api/ai/dashboard?t=${Date.now()}`, {
            headers: authHeaders()
        });
        if (!response.ok) {
            throw new Error(`Dashboard request failed with status ${response.status}`);
        }

        const dashboard = await response.json();
        showSection('aiInsightsSection');
        renderOverview(dashboard.overview || {});
        renderStudents(dashboard.strugglingStudents || []);
        renderAlerts(dashboard.alerts || []);
        renderTopics(dashboard.topicInsights || []);
        if ((dashboard.overview?.totalTasks || 0) === 0) {
            setAiStatus('AI is online. No tracked task activity has been received yet, so the dashboard is waiting for student learning data.');
        } else {
            setAiStatus(`AI is active and analyzing ${dashboard.overview.totalTasks} tracked tasks across the class.`);
        }
    } catch (error) {
        console.error('Could not load AI insights:', error);
        showSection('aiInsightsSection');
        document.getElementById('aiOverviewGrid').innerHTML = '';
        document.getElementById('aiStudentsList').innerHTML = '<p class="empty-state">AI insights could not be loaded.</p>';
        document.getElementById('aiAlertsList').innerHTML = '<p class="empty-state">The teacher page could not reach the backend AI service.</p>';
        document.getElementById('aiTopicsList').innerHTML = '';
        setAiStatus(`AI dashboard connection failed. This page is using ${BACKEND_BASE_URL}. Make sure that backend is running and reachable.`, 'error');
    }
}

async function loadClasses() {
    const select = document.getElementById('testClass');
    if (!select) return;
    select.innerHTML = '';
    try {
        if (isDemo) {
            const option = document.createElement('option');
            option.value = demoData.student.className;
            option.textContent = demoData.student.className;
            select.appendChild(option);
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/classes`, {
            headers: authHeaders()
        });
        const classes = res.ok ? await res.json() : [];
        if (!classes.length) {
            select.innerHTML = '<option value="">No classes found</option>';
            return;
        }
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls;
            option.textContent = cls;
            select.appendChild(option);
        });
    } catch (error) {
        select.innerHTML = '<option value="">No classes found</option>';
        console.error('Could not load classes:', error);
    }
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
        return false;
    }

    const questions = questionsInput
        ? questionsInput.split('\n').map(q => q.trim()).filter(Boolean)
        : [];

    try {
        setTestStatus('Creating test...');
        if (isDemo && demoData) {
            const id = Math.floor(Date.now() / 1000);
            const demoTest = {
                id,
                title,
                subject,
                assignments: [{ className, dueDate }]
            };
            demoData.teacherTests.unshift(demoTest);
            demoData.tests.unshift({
                testId: id,
                title,
                subject,
                dueDate,
                questionsJson: JSON.stringify(questions),
                status: 'ASSIGNED',
                score: null,
                feedback: null
            });
            setTestStatus('Test created and assigned (demo).');
            document.getElementById('testTitle').value = '';
            document.getElementById('testSubject').value = '';
            document.getElementById('testDescription').value = '';
            document.getElementById('testQuestions').value = '';
            document.getElementById('testPoints').value = '';
            loadTests();
            return true;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                title,
                subject,
                description,
                questionsJson: JSON.stringify(questions),
                totalPoints
            })
        });
        if (!res.ok) throw new Error(`Create failed ${res.status}`);
        const created = await res.json();

        setTestStatus('Assigning test...');
        const assignRes = await fetch(`${BACKEND_BASE_URL}/api/tests/${created.id}/assign`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                className,
                dueDate
            })
        });
        if (!assignRes.ok) throw new Error(`Assign failed ${assignRes.status}`);
        await assignRes.json();

        socket.emit('test-assigned', { className, testId: created.id });
        setTestStatus('Test created and assigned.');
        document.getElementById('testTitle').value = '';
        document.getElementById('testSubject').value = '';
        document.getElementById('testDescription').value = '';
        document.getElementById('testQuestions').value = '';
        document.getElementById('testPoints').value = '';
        loadTests();
        return true;
    } catch (error) {
        console.error('Could not create test:', error);
        setTestStatus('Failed to create test.');
        return false;
    }
}

function scheduleTestAutosave() {
    if (testAutosaveTimer) clearTimeout(testAutosaveTimer);
    testAutosaveTimer = setTimeout(async () => {
        const title = document.getElementById('testTitle').value.trim();
        const className = document.getElementById('testClass').value;
        if (!title || !className) return;
        const subject = document.getElementById('testSubject').value.trim();
        const description = document.getElementById('testDescription').value.trim();
        const questionsInput = document.getElementById('testQuestions').value.trim();
        const totalPoints = document.getElementById('testPoints').value.trim();
        const dueDate = document.getElementById('testDueDate').value;
        const hash = `${title}|${className}|${subject}|${description}|${questionsInput}|${totalPoints}|${dueDate}`;
        if (hash === lastTestHash) return;
        setTestStatus('Autosaving...');
        const success = await createTest();
        if (success) lastTestHash = hash;
    }, 1200);
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
        const assignmentText = assignments.length
            ? assignments.map(a => `${a.className}${a.dueDate ? ` • due ${a.dueDate}` : ''}`).join(', ')
            : 'Not assigned yet';
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

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatSubmissionAnswers(answersJson) {
    if (!answersJson) return '<pre class="test-meta"></pre>';
    try {
        const parsed = JSON.parse(answersJson);
        if (parsed?.mode === 'canvas_test') {
            const note = escapeHtml(parsed.note || 'No note.');
            return `
                <div class="test-meta">Canvas exam submission received.</div>
                <details>
                    <summary>Show student note</summary>
                    <pre class="test-meta">${note}</pre>
                </details>
            `;
        }
    } catch {
        // Keep default rendering below.
    }
    return `<pre class="test-meta">${escapeHtml(answersJson)}</pre>`;
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
                    ${formatSubmissionAnswers(sub.answersJson)}
                    <div class="test-row">
                        <input type="number" min="0" placeholder="Score" id="score-${sub.id}" value="${sub.score ?? ''}">
                        <input type="text" placeholder="Feedback" id="feedback-${sub.id}" value="${sub.feedback ?? ''}">
                        <button class="action-btn" onclick="gradeSubmission(${sub.id}, '${demoData.student.name}')">Grade</button>
                    </div>
                </div>
            `).join('');
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/submissions/test/${testId}`, {
            headers: authHeaders()
        });
        const submissions = res.ok ? await res.json() : [];
        if (!submissions.length) {
            list.innerHTML = '<p class="empty-state">No submissions yet.</p>';
            return;
        }

        list.innerHTML = submissions.map(sub => `
            <div class="submission-card">
                <strong>Student: ${sub.studentName || 'Student'}</strong>
                <div class="test-meta">Status: ${sub.status || 'SUBMITTED'}</div>
                <div class="test-meta">Answers:</div>
                ${formatSubmissionAnswers(sub.answersJson)}
                <div class="test-row">
                    <input type="number" min="0" placeholder="Score" id="score-${sub.id}" value="${sub.score ?? ''}">
                    <input type="text" placeholder="Feedback" id="feedback-${sub.id}" value="${sub.feedback ?? ''}">
                    <button class="action-btn" onclick="gradeSubmission(${sub.id}, '${sub.studentName || 'Student'}')">Grade</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Could not load submissions:', error);
        list.innerHTML = '<p class="empty-state">Failed to load submissions.</p>';
    }
}

async function gradeSubmission(submissionId, studentName) {
    const score = document.getElementById(`score-${submissionId}`).value;
    const feedback = document.getElementById(`feedback-${submissionId}`).value;
    try {
        if (isDemo && demoData) {
            const submissions = Object.values(demoData.testSubmissions).flat();
            const sub = submissions.find(s => s.id === submissionId);
            if (sub) {
                sub.score = score ? parseInt(score, 10) : null;
                sub.feedback = feedback || 'Demo feedback saved.';
                sub.status = 'GRADED';
            }
            loadSubmissions(Object.keys(demoData.testSubmissions).find(id => (demoData.testSubmissions[id] || []).some(s => s.id === submissionId)) || submissionId);
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/submission/${submissionId}/grade`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ score: score ? parseInt(score, 10) : null, feedback })
        });
        if (!res.ok) throw new Error(`Grade failed ${res.status}`);
        const graded = await res.json();
        socket.emit('test-graded', { studentName, testId: graded.testId });
        loadSubmissions(graded.testId);
    } catch (error) {
        console.error('Could not grade submission:', error);
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
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/teacher/me`, {
            headers: authHeaders()
        });
        const tests = res.ok ? await res.json() : [];
        renderTests(tests);
    } catch (error) {
        console.error('Could not load tests:', error);
    }
}

if (!isDemo) {
    socket.on('test-submitted', () => {
        if (document.getElementById('testsSection')?.style.display === 'block') {
            loadTests();
        }
    });
}

window.lockClassroom = lockClassroom;
window.unlockClassroom = unlockClassroom;
window.syncClassroomPanel = syncClassroomPanel;

function setTeacherLanguage(lang) {
    teacherLang = ['en', 'bg', 'it', 'de', 'el', 'ro', 'sr'].includes(lang) ? lang : 'en';
    const words = {
        en: { logout: 'Logout', workspace: 'Teacher Workspace', directory: 'Directory', users: 'Users', refresh: 'Refresh' },
        bg: { logout: 'Изход', workspace: 'Учителски профил', directory: 'Директория', users: 'Потребители', refresh: 'Обнови' },
        it: { logout: 'Esci', workspace: 'Area Docente', directory: 'Directory', users: 'Utenti', refresh: 'Aggiorna' },
        de: { logout: 'Abmelden', workspace: 'Lehrerbereich', directory: 'Verzeichnis', users: 'Benutzer', refresh: 'Aktualisieren' },
        el: { logout: 'Έξοδος', workspace: 'Χώρος Καθηγητή', directory: 'Κατάλογος', users: 'Χρήστες', refresh: 'Ανανέωση' },
        ro: { logout: 'Ieșire', workspace: 'Spațiu Profesor', directory: 'Director', users: 'Utilizatori', refresh: 'Reîmprospătează' },
        sr: { logout: 'Одјава', workspace: 'Наставнички профил', directory: 'Директоријум', users: 'Корисници', refresh: 'Освежи' }
    };
    const w = words[teacherLang] || words.en;
    localStorage.setItem('teacherLang', teacherLang);
    const select = document.getElementById('teacherLanguageSelect');
    if (select) select.value = teacherLang;
    const logout = document.querySelector('.navbar .logout[href="/"]');
    if (logout) logout.textContent = w.logout;
    const eye = document.querySelector('.greeting .section-eyebrow');
    if (eye) eye.textContent = w.workspace;
    const dirEye = document.querySelector('#teacherDirectoryList')?.closest('.section-card')?.querySelector('.section-eyebrow');
    if (dirEye) dirEye.textContent = w.directory;
    const dirTitle = document.querySelector('#teacherDirectoryList')?.closest('.section-card')?.querySelector('.section-title');
    if (dirTitle) dirTitle.textContent = w.users;
    const dirBtn = document.querySelector('#teacherDirectoryList')?.closest('.section-card')?.querySelector('button');
    if (dirBtn) dirBtn.textContent = w.refresh;
}

async function loadTeacherDirectoryUsers() {
    const list = document.getElementById('teacherDirectoryList');
    if (!list) return;
    try {
        if (isDemo && demoData) {
            const users = (demoData.users || []);
            if (!users.length) {
                list.innerHTML = '<p class="empty-state">No users found.</p>';
                return;
            }
            list.innerHTML = users.map(u => `
                <div class="user-card-item">
                    <h4>${u.displayName || u.name || 'User'}</h4>
                    <div class="user-meta">${u.role || 'USER'} • ${u.email || '-'}</div>
                </div>
            `).join('');
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/user/directory`, { headers: authHeaders() });
        const users = res.ok ? await res.json() : [];
        if (!users.length) {
            list.innerHTML = '<p class="empty-state">No users found.</p>';
            return;
        }
        list.innerHTML = users.map(u => `
            <div class="user-card-item">
                <h4>${u.displayName || 'User'}</h4>
                <div class="user-meta">${u.role || 'USER'} • ${u.email || '-'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Could not load directory users:', error);
        list.innerHTML = '<p class="empty-state">No users found.</p>';
    }
}

window.setTeacherLanguage = setTeacherLanguage;
window.loadTeacherDirectoryUsers = loadTeacherDirectoryUsers;
setTeacherLanguage(teacherLang);
loadTeacherDirectoryUsers();
