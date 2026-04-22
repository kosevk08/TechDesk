const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const user = JSON.parse(localStorage.getItem('user'));
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);
let adminLang = localStorage.getItem('adminLang') || 'en';
const ADMIN_BOOTSTRAP_KEY = 'techdesk-secret-2026';
const OWNER_EMAIL = 'admin@edu-school.bg';
let cachedSubjects = [];
const isOwnerAdminAccount = !isDemo && String(user?.email || '').toLowerCase() === OWNER_EMAIL;
let feedbackFilterMode = 'open';
let feedbackCache = [];

function authHeaders(extra = {}) {
    const headers = { ...extra };
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

const adminNameEl = document.getElementById('adminName');
const adminGreetingEl = document.getElementById('adminGreeting');

function applyAdminGreeting() {
    if (isOwnerAdminAccount) {
        if (adminGreetingEl) adminGreetingEl.textContent = 'Здравейте,';
        if (adminNameEl) adminNameEl.textContent = 'собственици';
        return;
    }
    if (adminGreetingEl) adminGreetingEl.textContent = 'Welcome,';
    if (adminNameEl) adminNameEl.textContent = user.displayName || 'Admin';
}

applyAdminGreeting();

function applyOwnerButtonAccess() {
    const ownerBtn = document.getElementById('ownerAnalyticsBtn');
    if (!ownerBtn) return;
    ownerBtn.style.display = isOwnerAdminAccount ? 'inline-flex' : 'none';
}

applyOwnerButtonAccess();

function applyFeedbackAccess() {
    const feedbackSection = document.getElementById('feedbackSection');
    if (!feedbackSection) return;
    feedbackSection.style.display = isOwnerAdminAccount ? '' : 'none';
}

applyFeedbackAccess();

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
    const metricItems = [
        { label: 'Total Users', value: counts.total },
        { label: 'Students', value: counts.student },
        { label: 'Teachers', value: counts.teacher },
        { label: 'Parents', value: counts.parent },
        { label: 'Admins', value: counts.admin }
    ];
    if (isOwnerAdminAccount) {
        metricItems.push({ label: 'Feedback Reports', value: feedbackCount });
    }
    metrics.innerHTML = metricItems.map(metric => `
        <div class="metric-card">
            <span class="metric-label">${metric.label}</span>
            <strong class="metric-value">${metric.value}</strong>
        </div>
    `).join('');
}

function normalizeUser(u) {
    const fromEmail = String(u.email || '')
        .split('@')[0]
        .replace(/[-_.]+/g, ' ')
        .replace(/\b(student|teacher|parent|admin)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    const fromNames = `${String(u.firstName || '').trim()} ${String(u.lastName || '').trim()}`.trim();
    const rawDisplay = String(u.displayName || u.fullName || u.name || '').trim();
    const genericDisplay = /^user(\s+user)?$/i.test(rawDisplay) || /^unknown$/i.test(rawDisplay);
    const resolvedDisplay = (!rawDisplay || genericDisplay) ? '' : rawDisplay;
    return {
        egn: u.egn || '',
        displayName: resolvedDisplay || fromNames || fromEmail || 'User',
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
        const subjects = res.ok ? await res.json() : [];
        cachedSubjects = Array.isArray(subjects) ? subjects : [];
        populateSubjectSuggestions(cachedSubjects);
        return cachedSubjects;
    } catch (error) {
        console.error('Could not load subjects:', error);
        cachedSubjects = [];
        populateSubjectSuggestions(cachedSubjects);
        return [];
    }
}

function populateSubjectSuggestions(subjects) {
    const dataList = document.getElementById('subjectSuggestions');
    if (!dataList) return;
    dataList.innerHTML = (subjects || [])
        .map((s) => String(s?.name || '').trim())
        .filter(Boolean)
        .map((name) => `<option value="${name}"></option>`)
        .join('');
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

function humanNameFromEmail(email, fallback = 'Teacher User') {
    const local = String(email || '')
        .split('@')[0]
        .replace(/[-_.]+/g, ' ')
        .replace(/\b(student|teacher|parent|admin)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!local) return fallback;
    return local
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || fallback;
}

function renderFeedback(items) {
    const list = document.getElementById('feedbackList');
    if (!list) return;
    const visibleItems = (items || []).filter((item) => (
        feedbackFilterMode === 'all' ? true : !item?.resolved
    ));
    if (!visibleItems.length) {
        list.innerHTML = '<p class="empty-state">No feedback yet.</p>';
        return;
    }
    list.innerHTML = visibleItems.map(item => `
        <div class="feedback-card-item ${item.resolved ? 'resolved' : ''}">
            <div class="feedback-meta">${item.page || 'Unknown'} • ${new Date(item.createdAt).toLocaleString()}</div>
            <h4>${item.sender || item.userDisplayName || 'User'}</h4>
            <div class="feedback-meta">${item.message}</div>
            <div class="feedback-actions-row">
                <span class="${item.resolved ? 'feedback-badge resolved' : badgeClass(item.severity)}">${item.resolved ? 'Resolved' : (item.severity || 'Low')}</span>
                ${item.resolved
                    ? `<span class="feedback-meta">Fixed: ${item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : '-'}</span>`
                    : `<button class="action-btn secondary-btn" onclick="markFeedbackResolved(${item.id})">Mark as fixed</button>`
                }
            </div>
        </div>
    `).join('');
}

function showUnresolvedFeedback() {
    feedbackFilterMode = 'open';
    renderFeedback(feedbackCache);
}

function showAllFeedback() {
    feedbackFilterMode = 'all';
    renderFeedback(feedbackCache);
}

async function markFeedbackResolved(id) {
    if (!isOwnerAdminAccount || !id || isDemo) return;
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/feedback/${id}/resolve`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (!res.ok) throw new Error(`Resolve failed ${res.status}`);
        await loadFeedback();
    } catch (error) {
        console.error('Could not resolve feedback:', error);
    }
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

async function deleteNotebookPageAdmin() {
    const egnInput = document.getElementById('deleteNotebookEgn');
    const subjectInput = document.getElementById('deleteNotebookSubject');
    const pageInput = document.getElementById('deleteNotebookPage');
    const status = document.getElementById('deleteNotebookStatus');
    if (!egnInput || !subjectInput || !pageInput || !status) return;

    const studentEgn = String(egnInput.value || '').trim();
    const subject = String(subjectInput.value || '').trim();
    const pageNumber = Number(pageInput.value);

    if (!studentEgn || !subject || !Number.isInteger(pageNumber) || pageNumber < 1) {
        status.textContent = 'Student EGN, subject and valid page are required.';
        return;
    }

    if (isDemo) {
        status.textContent = 'Delete is disabled in demo mode.';
        return;
    }

    const confirmed = window.confirm(`Delete page ${pageNumber} for ${subject} (${studentEgn})?`);
    if (!confirmed) return;

    try {
        status.textContent = 'Deleting...';
        const res = await fetch(`${BACKEND_BASE_URL}/api/notebook/page`, {
            method: 'DELETE',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ studentEgn, subject, pageNumber })
        });
        if (!res.ok) throw new Error(`Delete failed ${res.status}`);
        status.textContent = 'Page deleted.';
        pageInput.value = '';
    } catch (error) {
        console.error('Could not delete notebook page:', error);
        status.textContent = 'Delete failed.';
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
    if (!isOwnerAdminAccount) {
        return [];
    }
    if (isDemo) {
        const local = JSON.parse(localStorage.getItem('demo-feedback') || '[]');
        const items = local.length ? local : (demoData?.feedback || []);
        feedbackCache = items;
        renderFeedback(feedbackCache);
        return items;
    }
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/feedback/all`, {
            headers: authHeaders()
        });
        const items = res.ok ? await res.json() : [];
        feedbackCache = items;
        renderFeedback(feedbackCache);
        return items;
    } catch (error) {
        console.error('Could not load feedback:', error);
        feedbackCache = [];
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
                    const baseName = String(u.displayName || '').trim();
                    const display = (!baseName || /^user(\s+user)?$/i.test(baseName))
                        ? humanNameFromEmail(u.email, 'Teacher User')
                        : baseName;
                    const parts = display.split(/\s+/);
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
    const availableSubjectNames = (cachedSubjects || [])
        .map((s) => String(s?.name || '').trim())
        .filter(Boolean);
    const subjectByLower = new Map(availableSubjectNames.map((name) => [name.toLowerCase(), name]));
    const subjects = input.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((raw) => {
            const exact = subjectByLower.get(raw.toLowerCase());
            if (exact) return exact;
            const soft = availableSubjectNames.find((name) => name.toLowerCase().includes(raw.toLowerCase()));
            return soft || raw;
        });

    if (!teacherEgn) {
        if (status) status.textContent = 'Choose teacher first.';
        return;
    }
    if (!subjects.length) {
        if (status) status.textContent = 'Add at least one subject.';
        return;
    }

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
        const updatedTeacher = await res.json();
        const persistedSubjects = (updatedTeacher?.subjects || subjects).filter(Boolean);
        input.value = persistedSubjects.join(', ');
        const selectedOption = select.selectedOptions[0];
        if (selectedOption) selectedOption.dataset.subjects = persistedSubjects.join(', ');
        status.textContent = 'Saved.';
        const [teachers, subjectList] = await Promise.all([loadTeachers(), loadSubjects()]);
        renderSubjectCoverage(subjectList, teachers);
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
window.markFeedbackResolved = markFeedbackResolved;
window.showUnresolvedFeedback = showUnresolvedFeedback;
window.showAllFeedback = showAllFeedback;
window.deleteNotebookPageAdmin = deleteNotebookPageAdmin;

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
