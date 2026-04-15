const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);
let adminLang = localStorage.getItem('adminLang') || 'en';
const ADMIN_BOOTSTRAP_KEY = 'techdesk-secret-2026';

function authHeaders(extra = {}) {
    const headers = token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
    if (user?.email) {
        headers['X-User-Email'] = user.email;
    }
    if (user?.egn) {
        headers['X-User-Egn'] = user.egn;
    }
    return headers;
}

if (!user || user.role !== 'ADMIN') {
    window.location.href = '/';
}

document.getElementById('adminName').textContent = user.displayName || 'Admin';

async function loadStatus() {
    const statusEl = document.getElementById('adminStatus');
    if (isDemo) {
        statusEl.textContent = 'Demo (offline safe)';
        return;
    }
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/user/health`);
        statusEl.textContent = res.ok ? 'All systems operational' : 'Degraded';
    } catch (error) {
        statusEl.textContent = 'Offline';
    }
}

function renderMetrics(users, feedbackCount) {
    const metrics = document.getElementById('adminMetrics');
    if (!metrics) return;
    const counts = {
        total: users.length,
        student: users.filter(u => u.role === 'STUDENT').length,
        teacher: users.filter(u => u.role === 'TEACHER').length,
        parent: users.filter(u => u.role === 'PARENT').length,
        admin: users.filter(u => u.role === 'ADMIN').length
    };
    metrics.innerHTML = [
        { label: 'Total Users', value: counts.total },
        { label: 'Students', value: counts.student },
        { label: 'Teachers', value: counts.teacher },
        { label: 'Parents', value: counts.parent },
        { label: 'Admins', value: counts.admin },
        { label: 'Feedback Reports', value: feedbackCount }
    ].map(metric => `
        <div class="metric-card">
            <span class="metric-label">${metric.label}</span>
            <strong class="metric-value">${metric.value}</strong>
        </div>
    `).join('');
}

function normalizeUser(u) {
    const fromNames = `${String(u.firstName || '').trim()} ${String(u.lastName || '').trim()}`.trim();
    return {
        egn: u.egn || '',
        displayName: u.displayName || u.fullName || u.name || fromNames || 'User',
        role: u.role || 'USER',
        email: u.email || '-'
    };
}

function uniqueUsers(users) {
    const map = new Map();
    (users || []).forEach((u) => {
        const key = String(u.egn || u.email || u.displayName || '').trim() || `u-${map.size}`;
        if (!map.has(key)) map.set(key, u);
    });
    return Array.from(map.values());
}

async function fetchDirectoryUsers() {
    const res = await fetch(`${BACKEND_BASE_URL}/api/user/directory?t=${Date.now()}`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`/api/user/directory failed: ${res.status}`);
    const payload = await res.json();
    return Array.isArray(payload) ? payload.map(normalizeUser) : [];
}

async function fetchAllUsersAdmin() {
    const headers = authHeaders({ 'X-Admin-Key': ADMIN_BOOTSTRAP_KEY });
    const res = await fetch(`${BACKEND_BASE_URL}/api/user/all?t=${Date.now()}`, { headers });
    if (!res.ok) throw new Error(`/api/user/all failed: ${res.status}`);
    const payload = await res.json();
    return Array.isArray(payload) ? payload.map(normalizeUser) : [];
}

function renderUsers(users) {
    const list = document.getElementById('userList');
    if (!list) return;
    if (!users.length) {
        list.innerHTML = '<p class="empty-state">No users found.</p>';
        return;
    }
    list.innerHTML = users.map(u => `
        <div class="user-card-item">
            <h4>${u.displayName}</h4>
            <div class="user-meta">${u.role} • ${u.email}</div>
        </div>
    `).join('');
}

function populateRoleUsers(users) {
    const select = document.getElementById('roleUserSelect');
    if (!select) return;
    select.innerHTML = '';
    users.forEach((u) => {
        const option = document.createElement('option');
        option.value = u.egn || '';
        option.textContent = `${u.displayName} (${u.role})`;
        option.dataset.role = u.role || 'STUDENT';
        select.appendChild(option);
    });
    if (users.length) {
        document.getElementById('roleValueSelect').value = users[0].role || 'STUDENT';
    }
}

function renderTeachers(teachers) {
    const list = document.getElementById('teacherList');
    if (!list) return;
    if (!teachers.length) {
        list.innerHTML = '<p class="empty-state">No teachers found.</p>';
        return;
    }
    list.innerHTML = teachers.map(t => `
        <div class="user-card-item">
            <h4>${t.firstName || ''} ${t.lastName || ''}</h4>
            <div class="user-meta">${t.email || 'No email'} • ${t.egn}</div>
            <div class="user-meta">Subjects: ${(t.subjects || []).join(', ') || 'Not assigned'}</div>
        </div>
    `).join('');
}

function renderSubjectCoverage(subjects, teachers) {
    const container = document.getElementById('subjectCoverageList');
    if (!container) return;
    if (!subjects.length) {
        container.innerHTML = '<p class="empty-state">No subjects found.</p>';
        return;
    }

    const covered = new Set();
    (teachers || []).forEach(t => (t.subjects || []).forEach(s => covered.add(String(s).trim().toLowerCase())));
    const missing = subjects.filter(s => !covered.has(String(s.name || '').trim().toLowerCase()));

    if (!missing.length) {
        container.innerHTML = '<p class="metric-label">All subjects have at least one assigned teacher.</p>';
        return;
    }

    container.innerHTML = missing.map(s => `
        <div class="feedback-card-item">
            <h4>${s.name}</h4>
            <div class="feedback-meta">No teacher assigned yet.</div>
            <span class="feedback-badge high">Missing Coverage</span>
        </div>
    `).join('');
}

async function loadSubjects() {
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/subject/all`, { headers: authHeaders() });
        return res.ok ? await res.json() : [];
    } catch (error) {
        console.error('Could not load subjects:', error);
        return [];
    }
}

function populateTeacherSelect(teachers) {
    const select = document.getElementById('teacherSelect');
    if (!select) return;
    select.innerHTML = '';
    teachers.forEach(t => {
        const option = document.createElement('option');
        option.value = t.egn;
        option.textContent = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email || t.egn;
        option.dataset.subjects = (t.subjects || []).join(', ');
        select.appendChild(option);
    });
    if (teachers[0]) {
        document.getElementById('teacherSubjectsInput').value = (teachers[0].subjects || []).join(', ');
    }
}

function badgeClass(severity) {
    const key = String(severity || 'low').toLowerCase();
    if (key.includes('high')) return 'feedback-badge high';
    if (key.includes('medium')) return 'feedback-badge medium';
    return 'feedback-badge low';
}

function renderFeedback(items) {
    const list = document.getElementById('feedbackList');
    if (!list) return;
    if (!items.length) {
        list.innerHTML = '<p class="empty-state">No feedback yet.</p>';
        return;
    }
    list.innerHTML = items.map(item => `
        <div class="feedback-card-item">
            <div class="feedback-meta">${item.page || 'Unknown'} • ${new Date(item.createdAt).toLocaleString()}</div>
            <h4>${item.sender || item.userDisplayName || 'User'}</h4>
            <div class="feedback-meta">${item.message}</div>
            <span class="${badgeClass(item.severity)}">${item.severity || 'Low'}</span>
        </div>
    `).join('');
}

async function loadUsers() {
    if (isDemo && demoData) {
        const users = (demoData.users || []).map(normalizeUser);
        renderUsers(users);
        populateRoleUsers(users);
        return users;
    }
    try {
        let users = [];
        try {
            users = await fetchDirectoryUsers();
        } catch (primaryError) {
            console.warn('Primary directory fetch failed, trying /api/user/all fallback:', primaryError);
        }
        if (!users.length) {
            try {
                users = await fetchAllUsersAdmin();
            } catch (fallbackError) {
                console.warn('Fallback /api/user/all failed:', fallbackError);
            }
        }
        users = uniqueUsers(users);
        renderUsers(users);
        populateRoleUsers(users);
        return users;
    } catch (error) {
        console.error('Could not load users:', error);
        renderUsers([]);
        populateRoleUsers([]);
        return [];
    }
}

async function saveUserRole() {
    const userSelect = document.getElementById('roleUserSelect');
    const roleSelect = document.getElementById('roleValueSelect');
    const status = document.getElementById('roleStatus');
    if (!userSelect || !roleSelect || !status) return;
    const egn = userSelect.value;
    const role = roleSelect.value;
    if (!egn || !role) {
        status.textContent = 'Select user and role.';
        return;
    }
    if (isDemo) {
        status.textContent = 'Saved (demo).';
        return;
    }
    try {
        status.textContent = 'Saving...';
        const res = await fetch(`${BACKEND_BASE_URL}/api/user/role`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ egn, role })
        });
        if (!res.ok) throw new Error(`Role update failed ${res.status}`);
        status.textContent = 'Saved.';
        await Promise.all([loadUsers(), loadTeachers()]);
    } catch (error) {
        console.error('Could not save role:', error);
        status.textContent = 'Failed.';
    }
}

function setAdminLanguage(lang) {
    adminLang = ['en', 'bg', 'it', 'de', 'el', 'ro', 'sr'].includes(lang) ? lang : 'en';
    const words = {
        en: { logout: 'Logout', workspace: 'Administrator Workspace', directory: 'Directory', users: 'Users', refresh: 'Refresh' },
        bg: { logout: 'Изход', workspace: 'Администраторски профил', directory: 'Директория', users: 'Потребители', refresh: 'Обнови' },
        it: { logout: 'Esci', workspace: 'Area Amministratore', directory: 'Directory', users: 'Utenti', refresh: 'Aggiorna' },
        de: { logout: 'Abmelden', workspace: 'Adminbereich', directory: 'Verzeichnis', users: 'Benutzer', refresh: 'Aktualisieren' },
        el: { logout: 'Έξοδος', workspace: 'Χώρος Διαχειριστή', directory: 'Κατάλογος', users: 'Χρήστες', refresh: 'Ανανέωση' },
        ro: { logout: 'Ieșire', workspace: 'Spațiu Administrator', directory: 'Director', users: 'Utilizatori', refresh: 'Reîmprospătează' },
        sr: { logout: 'Одјава', workspace: 'Админ профил', directory: 'Директоријум', users: 'Корисници', refresh: 'Освежи' }
    };
    const w = words[adminLang] || words.en;
    localStorage.setItem('adminLang', adminLang);
    const select = document.getElementById('adminLanguageSelect');
    if (select) select.value = adminLang;
    const logout = document.querySelector('.navbar .logout[href="/"]');
    if (logout) logout.textContent = w.logout;
    const eye = document.querySelector('.greeting .section-eyebrow');
    if (eye) eye.textContent = w.workspace;
    const userSection = document.getElementById('userList')?.closest('.section-card');
    if (userSection) {
        const e = userSection.querySelector('.section-eyebrow');
        const t = userSection.querySelector('.section-title');
        const b = userSection.querySelector('button');
        if (e) e.textContent = w.directory;
        if (t) t.textContent = w.users;
        if (b) b.textContent = w.refresh;
    }
}

async function loadFeedback() {
    if (isDemo) {
        const local = JSON.parse(localStorage.getItem('demo-feedback') || '[]');
        const items = local.length ? local : (demoData?.feedback || []);
        renderFeedback(items);
        return items;
    }
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/feedback/all`, {
            headers: authHeaders()
        });
        const items = res.ok ? await res.json() : [];
        renderFeedback(items);
        return items;
    } catch (error) {
        console.error('Could not load feedback:', error);
        renderFeedback([]);
        return [];
    }
}

async function loadTeachers() {
    if (isDemo && demoData) {
        const teachers = (demoData.teachers || [
            { egn: '2000000003', firstName: 'Maya', lastName: 'Ivanova', email: demoData?.teacher?.email, subjects: ['Maths'] }
        ]);
        populateTeacherSelect(teachers);
        renderTeachers(teachers);
        return teachers;
    }
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/teacher/all`, {
            headers: authHeaders()
        });
        let teachers = res.ok ? await res.json() : [];
        if (!teachers.length) {
            const users = await loadUsers();
            teachers = users
                .filter(u => String(u.role || '').toUpperCase() === 'TEACHER')
                .map((u) => {
                    const parts = String(u.displayName || 'Teacher User').trim().split(/\s+/);
                    return {
                        egn: u.egn || '',
                        firstName: parts[0] || 'Teacher',
                        lastName: parts.slice(1).join(' ') || 'User',
                        email: u.email || '',
                        subjects: []
                    };
                });
        }
        populateTeacherSelect(teachers);
        renderTeachers(teachers);
        return teachers;
    } catch (error) {
        console.error('Could not load teachers:', error);
        renderTeachers([]);
        return [];
    }
}

async function saveTeacherSubjects() {
    const status = document.getElementById('teacherSubjectStatus');
    const select = document.getElementById('teacherSelect');
    const input = document.getElementById('teacherSubjectsInput');
    if (!select || !input) return;
    const teacherEgn = select.value;
    const subjects = input.value.split(',').map(s => s.trim()).filter(Boolean);

    if (isDemo) {
        status.textContent = 'Saved (demo).';
        return;
    }

    try {
        status.textContent = 'Saving...';
        const res = await fetch(`${BACKEND_BASE_URL}/api/teacher/subjects`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ teacherEgn, subjects })
        });
        if (!res.ok) throw new Error('Save failed');
        status.textContent = 'Saved.';
        loadTeachers();
    } catch (error) {
        console.error('Could not save subjects:', error);
        status.textContent = 'Failed.';
    }
}

function teacherPreferredSubjects(teacher) {
    const email = String(teacher?.email || '').toLowerCase();
    const display = `${teacher?.firstName || ''} ${teacher?.lastName || ''}`.toLowerCase();
    const bag = `${email} ${display}`;
    const matchers = [
        { keys: ['math'], subject: 'Maths' },
        { keys: ['phys'], subject: 'Physics' },
        { keys: ['chem'], subject: 'Chemistry' },
        { keys: ['bio'], subject: 'Biology' },
        { keys: ['eng', 'english'], subject: 'English' },
        { keys: ['bulgar'], subject: 'Bulgarian Language and Literature' },
        { keys: ['geo'], subject: 'Geography' },
        { keys: ['philo'], subject: 'Philosophy' },
        { keys: ['german'], subject: 'German (A1)' },
        { keys: ['spanish'], subject: 'Spanish (A1)' },
        { keys: ['anthro'], subject: 'Social Anthropology' },
        { keys: ['lit'], subject: 'English Literature' }
    ];
    return matchers
        .filter((m) => m.keys.some((k) => bag.includes(k)))
        .map((m) => m.subject);
}

async function autoAssignSubjectTeachers() {
    const status = document.getElementById('teacherSubjectStatus');
    try {
        if (status) status.textContent = 'Assigning...';
        const [teachersRaw, subjectsRaw] = await Promise.all([loadTeachers(), loadSubjects()]);
        const teachers = (teachersRaw || []).filter((t) => t && t.egn);
        const subjectNames = (subjectsRaw || []).map((s) => s.name).filter(Boolean);
        if (!teachers.length || !subjectNames.length) {
            if (status) status.textContent = 'Need teachers and subjects first.';
            return;
        }

        const updatedMap = new Map();
        teachers.forEach((t) => {
            const existing = Array.isArray(t.subjects) ? t.subjects.filter(Boolean) : [];
            updatedMap.set(t.egn, new Set(existing));
        });

        subjectNames.forEach((subject, idx) => {
            const alreadyCovered = teachers.some((t) => (t.subjects || []).map(String).includes(subject));
            if (alreadyCovered) return;
            const preferredTeacher = teachers.find((t) => teacherPreferredSubjects(t).includes(subject));
            const fallbackTeacher = teachers[idx % teachers.length];
            const chosen = preferredTeacher || fallbackTeacher;
            if (!chosen) return;
            updatedMap.get(chosen.egn).add(subject);
        });

        for (const teacher of teachers) {
            const nextSubjects = Array.from(updatedMap.get(teacher.egn) || []);
            await fetch(`${BACKEND_BASE_URL}/api/teacher/subjects`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ teacherEgn: teacher.egn, subjects: nextSubjects })
            });
        }

        const refreshed = await loadTeachers();
        renderSubjectCoverage(subjectsRaw, refreshed);
        if (status) status.textContent = 'Auto assignment complete.';
    } catch (error) {
        console.error('Auto assignment failed:', error);
        if (status) status.textContent = 'Auto assignment failed.';
    }
}

async function init() {
    await loadStatus();
    const [users, feedback] = await Promise.all([loadUsers(), loadFeedback()]);
    renderMetrics(users, feedback.length);
    const [teachers, subjects] = await Promise.all([loadTeachers(), loadSubjects()]);
    renderSubjectCoverage(subjects, teachers);
    if (!users.length && !isDemo) {
        try {
            await fetch(`${BACKEND_BASE_URL}/api/user/setup`, {
                headers: authHeaders({ 'X-Admin-Key': ADMIN_BOOTSTRAP_KEY })
            });
            const [freshUsers, freshTeachers, freshSubjects] = await Promise.all([loadUsers(), loadTeachers(), loadSubjects()]);
            renderMetrics(freshUsers, feedback.length);
            renderSubjectCoverage(freshSubjects, freshTeachers);
        } catch (setupError) {
            console.warn('User setup bootstrap skipped:', setupError);
        }
    }
}

window.loadUsers = loadUsers;
window.loadFeedback = loadFeedback;
window.loadTeachers = loadTeachers;
window.saveTeacherSubjects = saveTeacherSubjects;
window.saveUserRole = saveUserRole;
window.setAdminLanguage = setAdminLanguage;
window.autoAssignSubjectTeachers = autoAssignSubjectTeachers;

init();
setAdminLanguage(adminLang);

const teacherSelect = document.getElementById('teacherSelect');
if (teacherSelect) {
    teacherSelect.addEventListener('change', (event) => {
        const option = event.target.selectedOptions[0];
        const subjects = option?.dataset?.subjects || '';
        const input = document.getElementById('teacherSubjectsInput');
        if (input) input.value = subjects;
    });
}

const roleUserSelect = document.getElementById('roleUserSelect');
if (roleUserSelect) {
    roleUserSelect.addEventListener('change', (event) => {
        const selected = event.target.selectedOptions[0];
        const role = selected?.dataset?.role || 'STUDENT';
        const roleValueSelect = document.getElementById('roleValueSelect');
        if (roleValueSelect) roleValueSelect.value = role;
    });
}
