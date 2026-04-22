const user = JSON.parse(localStorage.getItem('user'));
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io('https://techdesk-frontend.onrender.com');
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);

function authHeaders(extra = {}) {
    const headers = { ...extra };
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.egn) headers['X-User-Egn'] = user.egn;
    return headers;
}
if (!user) window.location.href = '/';

let studentNames = [];
if (isDemo && demoData) {
    studentNames = [demoData.student.name];
}

const backLink = document.getElementById('backLink');
const role = user.role;

if (role === 'TEACHER') {
    backLink.innerHTML = '<a href="/teacher">← Back</a>';
    document.getElementById('greetingText').textContent = 'Mark attendance for class 11D';
    document.getElementById('teacherView').style.display = 'block';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    loadStudentsForDate();
} else if (role === 'STUDENT') {
    backLink.innerHTML = '<a href="/student">← Back</a>';
    document.getElementById('greetingText').textContent = 'Your attendance record';
    document.getElementById('studentView').style.display = 'block';
    loadStudentAttendance('attendanceRecords');
} else if (role === 'PARENT') {
    backLink.innerHTML = '<a href="/parent">← Back</a>';
    document.getElementById('greetingText').textContent = `Attendance record for ${user.childName || 'Student'}`;
    document.getElementById('parentView').style.display = 'block';
    loadStudentAttendance('parentAttendanceRecords');
}

const attendanceMap = {};
let autosaveTimer = null;

async function loadStudentsForDate() {
    const date = document.getElementById('attendanceDate').value;
    const period = document.getElementById('attendancePeriod')?.value || 'ALL_DAY';
    if (!date) return;
    Object.keys(attendanceMap).forEach((key) => delete attendanceMap[key]);

    let existingRecords = [];
    try {
        if (isDemo && demoData) {
            existingRecords = demoData.attendance.map(record => ({
                studentName: demoData.student.name,
                status: record.status,
                date: record.date
            }));
        } else {
            const res = await fetch(`${BACKEND_BASE_URL}/api/attendance/date/${date}`, {
                headers: authHeaders()
            });
            if (res.ok) existingRecords = await res.json();
        }
    } catch (e) {}

    const existingMap = {};
    existingRecords
        .filter(r => (r.period || 'ALL_DAY') === period)
        .forEach(r => existingMap[r.studentName] = r.status);

    if (!isDemo && studentNames.length === 0) {
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/api/student/names`, { headers: authHeaders() });
            studentNames = res.ok ? (await res.json()).map(s => s.fullName) : [];
        } catch (e) {
            studentNames = [];
        }
    }

    const list = document.getElementById('studentAttendanceList');
    list.innerHTML = '';
    document.getElementById('saveAllBtn').style.display = 'inline-block';

    studentNames.forEach(name => {
        const status = existingMap[name] || null;
        if (status) attendanceMap[name] = status;

        const row = document.createElement('div');
        row.className = 'student-row';
        row.innerHTML = `
            <div>
                <h4>${name}</h4>
            </div>
            <div class="status-btns">
                <button class="status-btn present-btn ${status === 'PRESENT' ? 'active' : ''}"
                    onclick="setStatus('${name}', 'PRESENT', this)">Present</button>
                <button class="status-btn absent-btn ${status === 'ABSENT_UNEXCUSED' ? 'active' : ''}"
                    onclick="setStatus('${name}', 'ABSENT_UNEXCUSED', this)">Absent (Unexcused)</button>
                <button class="status-btn absent-btn ${status === 'ABSENT_EXCUSED' ? 'active' : ''}"
                    onclick="setStatus('${name}', 'ABSENT_EXCUSED', this)">Absent (Excused)</button>
                <button class="status-btn late-btn ${status === 'LATE' ? 'active' : ''}"
                    onclick="setStatus('${name}', 'LATE', this)">Late</button>
            </div>
        `;
        list.appendChild(row);
    });
}

function setStatus(studentName, status, btn) {
    attendanceMap[studentName] = status;
    const row = btn.closest('.status-btns');
    row.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    scheduleAttendanceAutosave();
}

function scheduleAttendanceAutosave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => saveAll(), 800);
}

async function saveAll() {
    const date = document.getElementById('attendanceDate').value;
    const period = document.getElementById('attendancePeriod')?.value || 'ALL_DAY';
    if (isDemo && demoData) {
        demoData.attendance = Object.entries(attendanceMap).map(([name, status]) => ({
            date,
            status,
            period
        }));
    } else {
        const promises = Object.entries(attendanceMap).map(([studentName, status]) =>
            fetch(`${BACKEND_BASE_URL}/api/attendance/mark`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ studentName, date, status, period })
            })
        );
        await Promise.all(promises);
        Object.entries(attendanceMap).forEach(([studentName, status]) => {
            socket.emit('attendance-updated', { studentName, status, date, period });
        });
    }
    const msg = document.getElementById('savedMsg');
    msg.style.display = 'inline';
    setTimeout(() => msg.style.display = 'none', 2000);
}

async function loadStudentAttendance(containerId) {
    try {
        let records = [];
        if (isDemo && demoData) {
            records = demoData.attendance;
        } else {
            const res = await fetch(`${BACKEND_BASE_URL}/api/attendance/${role === 'PARENT' ? 'child' : 'me'}`, {
                headers: authHeaders()
            });
            records = await res.json();
        }
        const container = document.getElementById(containerId);

        if (records.length === 0) {
            container.innerHTML = '<p class="empty-msg">No attendance records yet.</p>';
            return;
        }

        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT_UNEXCUSED' || r.status === 'ABSENT_EXCUSED').length;
        const late = records.filter(r => r.status === 'LATE').length;

        container.innerHTML = `
            <div class="summary">
                <div class="summary-item">
                    <h3>${records.length}</h3>
                    <p>Total Records</p>
                </div>
                <div class="summary-item green">
                    <h3>${present}</h3>
                    <p>Present</p>
                </div>
                <div class="summary-item red">
                    <h3>${absent}</h3>
                    <p>Absent</p>
                </div>
                <div class="summary-item">
                    <h3>${late}</h3>
                    <p>Late</p>
                </div>
            </div>
        `;

        records.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(record => {
            const div = document.createElement('div');
            div.className = 'attendance-record';
            div.innerHTML = `
                <div>
                    <h4>${new Date(record.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                    <p style="font-size:12px; color:#64748b; margin-top:4px;">Period: ${record.period || 'ALL_DAY'}</p>
                </div>
                <span class="${record.status === 'PRESENT' ? 'badge-present' : 'badge-absent'}">
                    ${record.status === 'PRESENT' ? 'Present' :
                        record.status === 'LATE' ? 'Late' :
                        record.status === 'ABSENT_EXCUSED' ? 'Absent (Excused)' :
                        'Absent (Unexcused)'}
                </span>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error('Could not load attendance:', err);
    }
}
