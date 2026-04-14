const user = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token') || '';
const demoData = window.DemoData || {};
const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const adminKey = 'techdesk-secret-2026';

function secondNameOf(fullName, fallback = 'Admin') {
    const clean = String(fullName || '').trim();
    if (!clean) return fallback;
    const parts = clean.split(/\s+/);
    return parts[1] || parts[0] || fallback;
}

let teacherAssignments = (demoData.teachers || []).map((t) => ({
    egn: t.egn,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    subjects: Array.isArray(t.subjects) ? [...t.subjects] : []
}));

function authHeaders(extra = {}) {
    const headers = { ...extra, 'X-Admin-Key': adminKey };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

function setSystemStatus(text, ok = true) {
    const statusEl = document.getElementById('adminStatus');
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = ok ? '#0f766e' : '#b91c1c';
}

function safeText(v, fallback = '-') {
    if (v === null || v === undefined || v === '') return fallback;
    return String(v);
}

function escapeHtml(text) {
    return safeText(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderMetrics(users, feedback) {
    const metrics = document.getElementById('adminMetrics');
    if (!metrics) return;

    const byRole = { ADMIN: 0, TEACHER: 0, STUDENT: 0, PARENT: 0 };
    users.forEach((u) => {
        const role = (u.role || '').toUpperCase();
        if (byRole[role] !== undefined) byRole[role] += 1;
    });

    metrics.innerHTML = `
        <div class="metric-card"><span class="metric-label">Total Users</span><strong class="metric-value">${users.length}</strong></div>
        <div class="metric-card"><span class="metric-label">Teachers</span><strong class="metric-value">${byRole.TEACHER}</strong></div>
        <div class="metric-card"><span class="metric-label">Students</span><strong class="metric-value">${byRole.STUDENT}</strong></div>
        <div class="metric-card"><span class="metric-label">Feedback Reports</span><strong class="metric-value">${feedback.length}</strong></div>
    `;
}

function renderUsers(users) {
    const list = document.getElementById('userList');
    if (!list) return;

    if (!users.length) {
        list.innerHTML = '<p class="empty-state">No users found.</p>';
        return;
    }

    list.innerHTML = users.map((u, idx) => `
        <div class="user-card-item">
            <h4>${escapeHtml(u.displayName || u.email || `User ${idx + 1}`)}</h4>
            <p class="user-meta">${escapeHtml(u.email || '-')}</p>
            <p class="user-meta">Role: <strong>${escapeHtml(u.role || 'UNKNOWN')}</strong></p>
            <p class="user-meta">Demo: ${u.demo ? 'Yes' : 'No'}</p>
        </div>
    `).join('');
}

function feedbackClass(severity) {
    const s = (severity || '').toLowerCase();
    if (s.includes('high')) return 'high';
    if (s.includes('medium')) return 'medium';
    return 'low';
}

function renderFeedback(items) {
    const list = document.getElementById('feedbackList');
    if (!list) return;

    if (!items.length) {
        list.innerHTML = '<p class="empty-state">No feedback reports.</p>';
        return;
    }

    list.innerHTML = items.map((f) => `
        <article class="feedback-card-item">
            <h4>${escapeHtml(f.page || 'General Feedback')}</h4>
            <p class="feedback-meta">From: ${escapeHtml(f.sender || f.userDisplayName || 'Unknown')}</p>
            <p class="feedback-meta">${escapeHtml(f.createdAt || f.created_at || '-')}</p>
            <p>${escapeHtml(f.message || '')}</p>
            <span class="feedback-badge ${feedbackClass(f.severity)}">${escapeHtml(f.severity || 'Low')}</span>
        </article>
    `).join('');
}

function renderTeachers(teachers) {
    const teacherSelect = document.getElementById('teacherSelect');
    const teacherList = document.getElementById('teacherList');
    const subjectInput = document.getElementById('teacherSubjectsInput');
    const status = document.getElementById('teacherSubjectStatus');

    if (!teacherSelect || !teacherList) return;

    teacherSelect.innerHTML = teachers.map((t) => {
        const name = `${safeText(t.firstName)} ${safeText(t.lastName)}`.trim();
        return `<option value="${escapeHtml(t.egn || t.email || name)}">${escapeHtml(name || t.email || 'Teacher')}</option>`;
    }).join('');

    const refreshSelectedSubjects = () => {
        const selected = teachers.find((t) => (t.egn || t.email) === teacherSelect.value) || teachers[0];
        if (!selected) return;
        if (subjectInput) subjectInput.value = (selected.subjects || []).join(', ');
        if (status) status.textContent = 'Ready';
    };

    teacherSelect.onchange = refreshSelectedSubjects;
    refreshSelectedSubjects();

    teacherList.innerHTML = teachers.map((t) => {
        const name = `${safeText(t.firstName)} ${safeText(t.lastName)}`.trim();
        const subjects = (t.subjects || []).join(', ') || 'No subjects assigned';
        return `
            <div class="user-card-item">
                <h4>${escapeHtml(name || t.email || 'Teacher')}</h4>
                <p class="user-meta">${escapeHtml(t.email || '-')}</p>
                <p class="user-meta">Subjects: <strong>${escapeHtml(subjects)}</strong></p>
            </div>
        `;
    }).join('');
}

async function fetchUsersRemote() {
    const response = await fetch(`${BACKEND_BASE_URL}/api/user/all`, {
        headers: authHeaders()
    });
    if (!response.ok) throw new Error(`users_http_${response.status}`);
    return response.json();
}

async function fetchFeedbackRemote() {
    const response = await fetch(`${BACKEND_BASE_URL}/api/feedback/all`, {
        headers: authHeaders()
    });
    if (!response.ok) throw new Error(`feedback_http_${response.status}`);
    return response.json();
}

async function fetchTeachersRemote() {
    const response = await fetch(`${BACKEND_BASE_URL}/api/teacher/all`, {
        headers: authHeaders()
    });
    if (!response.ok) throw new Error(`teachers_http_${response.status}`);
    return response.json();
}

async function loadUsers() {
    const users = await fetchUsersRemote().catch(() => demoData.users || []);
    renderUsers(users);
    return users;
}

async function loadFeedback() {
    const feedback = await fetchFeedbackRemote().catch(() => demoData.feedback || []);
    renderFeedback(feedback);
    return feedback;
}

async function loadTeachers() {
    const teachers = await fetchTeachersRemote().catch(() => teacherAssignments);
    teacherAssignments = Array.isArray(teachers) ? teachers : [];
    renderTeachers(teacherAssignments);
    return teacherAssignments;
}

async function saveTeacherSubjects() {
    const teacherSelect = document.getElementById('teacherSelect');
    const subjectInput = document.getElementById('teacherSubjectsInput');
    const status = document.getElementById('teacherSubjectStatus');
    if (!teacherSelect || !subjectInput || !status) return;

    const teacherId = teacherSelect.value;
    const subjects = subjectInput.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/teacher/subjects`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ teacherEgn: teacherId, subjects })
        });

        if (!res.ok) throw new Error(`save_http_${res.status}`);

        status.textContent = 'Saved to backend';
        setSystemStatus('Connected', true);
    } catch (_err) {
        const idx = teacherAssignments.findIndex((t) => (t.egn || t.email) === teacherId);
        if (idx >= 0) teacherAssignments[idx].subjects = subjects;
        renderTeachers(teacherAssignments);
        status.textContent = 'Saved in demo mode';
        setSystemStatus('Demo mode fallback', false);
    }
}

async function bootstrapAdmin() {
    const adminName = document.getElementById('adminName');
    if (adminName) {
        adminName.textContent = secondNameOf(user?.displayName || demoData.admin?.name, 'Admin');
    }

    setSystemStatus('Loading...');

    const [users, feedback] = await Promise.all([
        loadUsers(),
        loadFeedback(),
        loadTeachers()
    ]).then((results) => [results[0], results[1]])
      .catch(() => [demoData.users || [], demoData.feedback || []]);

    renderMetrics(users || [], feedback || []);

    const hasToken = Boolean(token);
    setSystemStatus(hasToken ? 'Connected' : 'Demo mode fallback', hasToken);
}

document.addEventListener('DOMContentLoaded', bootstrapAdmin);

window.loadUsers = loadUsers;
window.loadFeedback = loadFeedback;
window.loadTeachers = loadTeachers;
window.saveTeacherSubjects = saveTeacherSubjects;
