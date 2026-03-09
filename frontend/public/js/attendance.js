const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = '/';

const allNames = {
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
    '2000000001': 'Miss Schmidt',
    '2000000002': 'Mr Popescu',
    '3000000001': 'Mr Navarro'
};

const studentEgns = [
    '1000000001','1000000002','1000000003','1000000004',
    '1000000005','1000000006','1000000007','1000000008',
    '1000000009','1000000010','1000000011','1000000012'
];

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
    loadStudentAttendance(user.egn, 'attendanceRecords');
} else if (role === 'PARENT') {
    backLink.innerHTML = '<a href="/parent">← Back</a>';
    document.getElementById('greetingText').textContent = `Attendance record for ${allNames[user.studentEgn] || user.studentEgn}`;
    document.getElementById('parentView').style.display = 'block';
    loadStudentAttendance(user.studentEgn, 'parentAttendanceRecords');
}

const attendanceMap = {};

async function loadStudentsForDate() {
    const date = document.getElementById('attendanceDate').value;
    if (!date) return;

    let existingRecords = [];
    try {
        const res = await fetch(`https://techdesk-backend.onrender.com/api/attendance/date/${date}`);
        if (res.ok) existingRecords = await res.json();
    } catch (e) {}

    const existingMap = {};
    existingRecords.forEach(r => existingMap[r.studentEgn] = r.status);

    const list = document.getElementById('studentAttendanceList');
    list.innerHTML = '';
    document.getElementById('saveAllBtn').style.display = 'inline-block';

    studentEgns.forEach(egn => {
        const status = existingMap[egn] || null;
        if (status) attendanceMap[egn] = status;

        const row = document.createElement('div');
        row.className = 'student-row';
        row.innerHTML = `
            <div>
                <h4>${allNames[egn]}</h4>
                <p>EGN: ${egn}</p>
            </div>
            <div class="status-btns">
                <button class="status-btn present-btn ${status === 'PRESENT' ? 'active' : ''}"
                    onclick="setStatus('${egn}', 'PRESENT', this)">✅ Present</button>
                <button class="status-btn absent-btn ${status === 'ABSENT' ? 'active' : ''}"
                    onclick="setStatus('${egn}', 'ABSENT', this)">❌ Absent</button>
            </div>
        `;
        list.appendChild(row);
    });
}

function setStatus(egn, status, btn) {
    attendanceMap[egn] = status;
    const row = btn.closest('.status-btns');
    row.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

async function saveAll() {
    const date = document.getElementById('attendanceDate').value;
    const promises = Object.entries(attendanceMap).map(([egn, status]) =>
        fetch('https://techdesk-backend.onrender.com/api/attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentEgn: egn, date, status })
        })
    );
    await Promise.all(promises);
    const msg = document.getElementById('savedMsg');
    msg.style.display = 'inline';
    setTimeout(() => msg.style.display = 'none', 2000);
}

async function loadStudentAttendance(egn, containerId) {
    try {
        const res = await fetch(`https://techdesk-backend.onrender.com/api/attendance/student/${egn}`);
        const records = await res.json();
        const container = document.getElementById(containerId);

        if (records.length === 0) {
            container.innerHTML = '<p class="empty-msg">No attendance records yet.</p>';
            return;
        }

        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;

        container.innerHTML = `
            <div class="summary">
                <div class="summary-item">
                    <h3>${records.length}</h3>
                    <p>Total Days</p>
                </div>
                <div class="summary-item green">
                    <h3>${present}</h3>
                    <p>Present</p>
                </div>
                <div class="summary-item red">
                    <h3>${absent}</h3>
                    <p>Absent</p>
                </div>
            </div>
        `;

        records.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(record => {
            const div = document.createElement('div');
            div.className = 'attendance-record';
            div.innerHTML = `
                <div>
                    <h4>${new Date(record.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                </div>
                <span class="${record.status === 'PRESENT' ? 'badge-present' : 'badge-absent'}">
                    ${record.status === 'PRESENT' ? '✅ Present' : '❌ Absent'}
                </span>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error('Could not load attendance:', err);
    }
}