const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'PARENT') {
    window.location.href = '/';
}

const parentNames = {
    'l.navarro-parent@edu-school.bg': 'Mr Navarro'
};

const egnToName = {
    '1000000002': 'Konstantin Kosev'
};

document.getElementById('parentName').textContent = parentNames[user.email] || user.email;
document.getElementById('studentName').textContent = egnToName[user.studentEgn] || user.studentEgn;

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
        const response = await fetch(`https://techdesk-backend.onrender.com/api/notebook/student/${user.studentEgn}?t=${Date.now()}`);
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
                    data-egn="${user.studentEgn}"
                    data-subject="${notebook.subject}">
                    View
                </button>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                viewNotebook(btn.dataset.egn, btn.dataset.subject);
            });
        });

    } catch (error) {
        console.error('Could not load notebooks:', error);
    }
}

function viewNotebook(studentEgn, subject) {
    currentStudentEgn = studentEgn;
    currentSubject = subject;
    currentPage = 1;

    document.getElementById('notebooksSection').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'block';
    document.getElementById('notebookTitle').textContent = `${egnToName[studentEgn]} - ${subject}`;

    const wrapper = document.getElementById('notebookCanvasWrapper');
    const isMaths = subject.toLowerCase() === 'maths';
    wrapper.className = 'notebook-canvas-wrapper ' + (isMaths ? 'squared' : 'lined');

    updatePageControls();
    loadPage();
}

async function loadPage() {
    try {
        const res = await fetch(`https://techdesk-backend.onrender.com/api/notebook/student/${currentStudentEgn}/${encodeURIComponent(currentSubject)}/${currentPage}?t=${Date.now()}`);
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
        const response = await fetch(`https://techdesk-backend.onrender.com/api/attendance/student/${user.studentEgn}?t=${Date.now()}`);
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
        const response = await fetch(`https://techdesk-backend.onrender.com/api/ai/parent/${user.studentEgn}?t=${Date.now()}`);
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
