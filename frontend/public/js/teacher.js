const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io();
const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'TEACHER') {
    window.location.href = '/';
}

const teacherNames = {
    'h.schmidt-teacher@edu-school.bg': 'Miss Schmidt',
    'a.popescu-teacher@edu-school.bg': 'Mr Popescu'
};

document.getElementById('teacherName').textContent = teacherNames[user.email] || user.email;

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
    '1000000012': 'Carlos Mendes'
};

let currentViewEgn = null;
let currentViewSubject = null;
let currentViewPage = 1;
const teacherCanvas = document.getElementById('teacherCanvas');
const tCtx = teacherCanvas.getContext('2d');
const aiStatusText = document.getElementById('aiStatusText');
const aiStatusBanner = document.getElementById('aiStatusBanner');

function showSection(sectionId) {
    ['aiInsightsSection', 'notebooksSection', 'notebookViewer'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === sectionId ? 'block' : 'none';
        }
    });
}

function subjectMatch(a, b) {
    return a && b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

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
            `${egnToName[currentViewEgn] || currentViewEgn} - ${currentViewSubject} (Page ${currentViewPage})`;
        tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
        loadTeacherPage();
    }
});

async function loadTeacherPage() {
    try {
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

async function loadNotebooks() {
    try {
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

        const section = document.getElementById('notebooksSection');
        const list = document.getElementById('notebooksList');
        showSection('notebooksSection');
        section.style.display = 'block';
        list.innerHTML = '';

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
                <button class="view-btn"
                    data-id="${notebook.id}"
                    data-egn="${notebook.studentEgn}"
                    data-subject="${notebook.subject}">
                    View
                </button>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                viewNotebook(btn.dataset.id, btn.dataset.egn, btn.dataset.subject);
            });
        });

    } catch (error) {
        console.error('Could not load notebooks:', error);
    }
}

function viewNotebook(id, studentEgn, subject) {
    currentViewEgn = studentEgn;
    currentViewSubject = subject;
    currentViewPage = 1;

    const studentName = egnToName[studentEgn] || studentEgn;
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
    currentViewSubject = null;
    currentViewPage = 1;
    document.getElementById('liveBadge').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'none';
    document.getElementById('notebooksSection').style.display = 'block';
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
        setAiStatus('Loading live classroom signals from the AI engine...');
        const response = await fetch(`${BACKEND_BASE_URL}/api/ai/dashboard?t=${Date.now()}`);
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
