const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const user = JSON.parse(localStorage.getItem('user'));
const OWNER_EMAIL = 'admin@edu-school.bg';

if (!user || user.role !== 'ADMIN') {
    window.location.href = '/';
}

const isOwnerAccount = !user.demo && String(user.email || '').toLowerCase() === OWNER_EMAIL;
if (!isOwnerAccount) {
    window.location.href = '/';
}

const PLAN_PRICE = {
    SCHOOL: 920,
    PREMIUM: 2200,
    STUDENT: 4.99 * 12
};
let ownerUsersCache = [];
let ownerFeedbackCache = 0;
let ownerPlanFilter = 'ALL';
let ownerToastTimer = null;

function authHeaders(extra = {}) {
    const headers = { ...extra };
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.egn) headers['X-User-Egn'] = user.egn;
    return headers;
}

function byRole(users) {
    return (users || []).reduce((acc, u) => {
        const role = String(u.role || 'OTHER').toUpperCase();
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});
}

function schoolSeeds(totalUsers) {
    const canonicalSchoolName = 'Private Foreign Language High School "Prof. Ivan Apostolov"';
    const legacyApostolovNames = new Set([
        'PG Prof. Iv. Apostolov - Sofia',
        'МГ "Проф.Иван Апостолов"',
        'MG "Prof. Ivan Apostolov"'
    ]);
    const local = localStorage.getItem('owner-school-plans');
    if (local) {
        try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length) {
                const normalized = parsed.map((item) => {
                    if (!item || typeof item !== 'object') return item;
                    if (legacyApostolovNames.has(item.school)) {
                        return { ...item, school: canonicalSchoolName };
                    }
                    return item;
                });
                localStorage.setItem('owner-school-plans', JSON.stringify(normalized));
                return normalized;
            }
        } catch (error) {
            console.warn('Bad owner school plan cache', error);
        }
    }

    const base = [
        { school: canonicalSchoolName, plan: 'PREMIUM', activeUsers: Math.max(120, Math.round(totalUsers * 0.38)), status: 'Active' },
        { school: 'Math Gymnasium Plovdiv', plan: 'SCHOOL', activeUsers: Math.max(80, Math.round(totalUsers * 0.24)), status: 'Active' },
        { school: 'Language School Varna', plan: 'SCHOOL', activeUsers: Math.max(65, Math.round(totalUsers * 0.19)), status: 'Active' },
        { school: 'STEM Hub Burgas', plan: 'STUDENT', activeUsers: Math.max(40, Math.round(totalUsers * 0.11)), status: 'Pilot' },
        { school: 'Tech Academy Ruse', plan: 'PREMIUM', activeUsers: Math.max(55, Math.round(totalUsers * 0.16)), status: 'Active' }
    ];
    localStorage.setItem('owner-school-plans', JSON.stringify(base));
    return base;
}

function renderMetrics(users, feedbackCount, schools) {
    const roles = byRole(users);
    const total = users.length;
    const paidSchools = schools.length;
    const monthlyStudents = schools
        .filter((s) => s.plan === 'STUDENT')
        .reduce((sum, s) => sum + s.activeUsers, 0);
    const annualRevenue = schools.reduce((sum, s) => sum + (PLAN_PRICE[s.plan] || 0), 0) + monthlyStudents * PLAN_PRICE.STUDENT;

    const metrics = [
        { label: 'Total Platform Users', value: total },
        { label: 'Student Accounts', value: roles.STUDENT || 0 },
        { label: 'Teacher Accounts', value: roles.TEACHER || 0 },
        { label: 'Parent Accounts', value: roles.PARENT || 0 },
        { label: 'Tenant Schools', value: paidSchools },
        { label: 'Feedback Reports', value: feedbackCount }
    ];

    document.getElementById('ownerRevenue').textContent = `€${Math.round(annualRevenue).toLocaleString()}/year`;
    document.getElementById('ownerMetrics').innerHTML = metrics.map((m) => `
        <article class="owner-metric">
            <span>${m.label}</span>
            <strong>${m.value}</strong>
        </article>
    `).join('');
}

function renderUsageChart(users) {
    const roles = byRole(users);
    const rows = [
        { key: 'STUDENT', label: 'Students', value: roles.STUDENT || 0 },
        { key: 'TEACHER', label: 'Teachers', value: roles.TEACHER || 0 },
        { key: 'PARENT', label: 'Parents', value: roles.PARENT || 0 },
        { key: 'ADMIN', label: 'Admins', value: roles.ADMIN || 0 }
    ];
    const max = Math.max(1, ...rows.map((r) => r.value));
    document.getElementById('usageBars').innerHTML = rows.map((r) => `
        <div class="usage-row">
            <span class="usage-label">${r.label}</span>
            <div class="usage-track">
                <div class="usage-fill" style="width:${Math.round((r.value / max) * 100)}%"></div>
            </div>
            <span class="usage-value">${r.value}</span>
        </div>
    `).join('');
}

function renderSchoolPlans(schools) {
    const body = document.getElementById('schoolPlanBody');
    const visible = (schools || []).filter((s) => ownerPlanFilter === 'ALL' || String(s.plan) === ownerPlanFilter);
    body.innerHTML = visible.map((s) => {
        const planClass = s.plan.toLowerCase();
        const annualValue = s.plan === 'STUDENT'
            ? Math.round((s.activeUsers || 0) * PLAN_PRICE.STUDENT)
            : PLAN_PRICE[s.plan];
        return `
            <tr>
                <td>${s.school}</td>
                <td>
                    <span class="plan-pill ${planClass}" id="plan-pill-${cssId(s.school)}">${s.plan}</span>
                    <div style="margin-top:8px;">
                        <select class="owner-plan-select" id="plan-select-${cssId(s.school)}" onchange="saveSchoolPlan('${jsSafe(s.school)}', this.value)">
                            <option value="SCHOOL" ${s.plan === 'SCHOOL' ? 'selected' : ''}>SCHOOL</option>
                            <option value="PREMIUM" ${s.plan === 'PREMIUM' ? 'selected' : ''}>PREMIUM</option>
                            <option value="STUDENT" ${s.plan === 'STUDENT' ? 'selected' : ''}>STUDENT</option>
                        </select>
                    </div>
                </td>
                <td>${s.activeUsers}</td>
                <td id="annual-value-${cssId(s.school)}">€${Number(annualValue || 0).toLocaleString()}/year</td>
                <td><span class="status-pill">${s.status || 'Active'}</span></td>
            </tr>
        `;
    }).join('') || `<tr><td colspan="5">No schools for this plan.</td></tr>`;
}

function cssId(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function jsSafe(value) {
    return String(value || '').replace(/'/g, "\\'");
}

function currentSchools() {
    const local = localStorage.getItem('owner-school-plans');
    if (!local) return [];
    try {
        const parsed = JSON.parse(local);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveSchoolPlan(schoolName, nextPlan = null) {
    const schools = currentSchools();
    const row = schools.find((s) => s.school === schoolName);
    if (!row) return;
    const select = document.getElementById(`plan-select-${cssId(schoolName)}`);
    const selectedValue = nextPlan || select?.value;
    if (!selectedValue) return;
    row.plan = selectedValue;
    localStorage.setItem('owner-school-plans', JSON.stringify(schools));

    const annualValue = row.plan === 'STUDENT'
        ? Math.round((row.activeUsers || 0) * PLAN_PRICE.STUDENT)
        : PLAN_PRICE[row.plan];
    renderMetrics(ownerUsersCache, ownerFeedbackCache, schools);
    renderSchoolPlans(schools);
    showOwnerToast(`Auto-saved: ${schoolName} -> ${row.plan}`);
}

function onPlanFilterChange(value) {
    ownerPlanFilter = ['ALL', 'SCHOOL', 'PREMIUM', 'STUDENT'].includes(value) ? value : 'ALL';
    renderSchoolPlans(currentSchools());
}

function exportSchoolsCsv() {
    const schools = currentSchools().filter((s) => ownerPlanFilter === 'ALL' || String(s.plan) === ownerPlanFilter);
    const header = ['School', 'Plan', 'ActiveUsers', 'AnnualValueEUR', 'Status'];
    const lines = schools.map((s) => {
        const annualValue = s.plan === 'STUDENT'
            ? Math.round((s.activeUsers || 0) * PLAN_PRICE.STUDENT)
            : PLAN_PRICE[s.plan];
        return [
            s.school,
            s.plan,
            s.activeUsers,
            annualValue,
            s.status || 'Active'
        ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techdesk-owner-schools-${ownerPlanFilter.toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showOwnerToast(`CSV exported (${ownerPlanFilter})`);
}

function showOwnerToast(message) {
    const toast = document.getElementById('ownerToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (ownerToastTimer) clearTimeout(ownerToastTimer);
    ownerToastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 1700);
}

async function loadUsers() {
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/user/directory?t=${Date.now()}`, { headers: authHeaders() });
        if (res.ok) return await res.json();
    } catch (error) {
        console.warn('Owner users load failed', error);
    }
    return [];
}

async function loadFeedbackCount() {
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/feedback/all?t=${Date.now()}`, { headers: authHeaders() });
        if (res.ok) {
            const items = await res.json();
            return Array.isArray(items) ? items.length : 0;
        }
    } catch (error) {
        console.warn('Owner feedback load failed', error);
    }
    return 0;
}

async function initOwner() {
    const [usersRaw, feedbackCount] = await Promise.all([loadUsers(), loadFeedbackCount()]);
    const users = Array.isArray(usersRaw) ? usersRaw : [];
    ownerUsersCache = users;
    ownerFeedbackCache = feedbackCount;
    const schools = schoolSeeds(users.length || 260);
    renderMetrics(users, feedbackCount, schools);
    renderUsageChart(users);
    renderSchoolPlans(schools);
}

window.saveSchoolPlan = saveSchoolPlan;
window.onPlanFilterChange = onPlanFilterChange;
window.exportSchoolsCsv = exportSchoolsCsv;

initOwner();
