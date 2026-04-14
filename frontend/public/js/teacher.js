const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io('https://techdesk-frontend.onrender.com');
const user = JSON.parse(localStorage.getItem('user'));
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);
let studentNames = [];
let gradeAutosaveTimer = null;
let lastGradeHash = null;
let testAutosaveTimer = null;
let currentLang = 'en';
let lastTestHash = null;
let strokeHistory = [];
let isPlayingBack = false;
let activeWritingTime = 0;
let lastStrokeTime = null;

function authHeaders(extra = {}) {
    return extra;
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TechDeskDB', 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('strokes')) db.createObjectStore('strokes', { autoIncrement: true });
            if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function saveStrokeOffline(strokeData) {
    try {
        const db = await openDB();
        const tx = db.transaction(['strokes', 'meta'], 'readwrite');
        tx.objectStore('strokes').add(strokeData);
        updateSyncStatus();
    } catch (err) {
        console.error('Failed to save offline stroke:', err);
    }
}

let assistant = null;

function createAssistant() {
    if (!assistant) {
        assistant = document.createElement('div');
        assistant.id = 'assistant-techie';
        assistant.className = 'assistant-icon';
        assistant.innerHTML = '🤖';
        document.body.appendChild(assistant);

        const style = document.createElement('style');
        style.textContent = `
            #assistant-techie { position: fixed; bottom: 20px; right: 20px; font-size: 40px; z-index: 1000; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0.7; }
            #assistant-techie.thinking { transform: scale(1.4) rotate(360deg); opacity: 1; filter: drop-shadow(0 0 10px #6366f1); }
        `;
        document.head.appendChild(style);
    }
}

async function updateSyncStatus() {
    try {
        const db = await openDB();
        const tx = db.transaction(['strokes'], 'readonly');
        const store = tx.objectStore('strokes');
        const countRequest = store.count();
        countRequest.onsuccess = () => {
            const count = countRequest.result;
            let indicator = document.getElementById('syncStatusIndicator');
            if (!indicator && count > 0) {
                indicator = document.createElement('div');
                indicator.id = 'syncStatusIndicator';
                indicator.className = 'ai-status-banner info';
                document.body.prepend(indicator);
            }
            if (indicator) {
                indicator.style.display = count > 0 ? 'block' : 'none';
                indicator.textContent = count > 0 ? `${count} items pending sync` : '';
            }
        };
    } catch (err) {
        console.warn('Sync status update skipped:', err);
    }
}

window.addEventListener('online', updateSyncStatus);

function injectEli5Styles() {
    if (document.getElementById('eli5Styles')) return;
    const style = document.createElement('style');
    style.id = 'eli5Styles';
    style.textContent = `
        @keyframes eli5FadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .eli5-content { animation: eli5FadeIn 0.3s ease-out forwards; }
    `;
    document.head.appendChild(style);
}

const teacherNames = {
    'h.schmidt-teacher@edu-school.bg': 'Miss Schmidt',
    'a.popescu-teacher@edu-school.bg': 'Mr Popescu',
    'e.vasileva-teacher@edu-school.bg': 'Mrs Vasileva',
    'm.ivanova-maths@edu-school.bg': 'Ms Ivanova',
    'p.georgiev-physics@edu-school.bg': 'Mr Georgiev',
    'l.stoyanova-chem@edu-school.bg': 'Ms Stoyanova',
    'd.petrov-biology@edu-school.bg': 'Mr Petrov',
    's.martin-english@edu-school.bg': 'Mr Martin',
    't.vasileva-bulgarian@edu-school.bg': 'Ms Vasileva',
    'g.stefanov-geography@edu-school.bg': 'Mr Stefanov',
    'r.dimitrova-philosophy@edu-school.bg': 'Ms Dimitrova',
    'n.koleva-englishlit@edu-school.bg': 'Ms Koleva',
    'v.georgieva-german@edu-school.bg': 'Ms Georgieva',
    'i.karaslavova-spanish@edu-school.bg': 'Ms Karaslavova',
    'e.nikolova-anthro@edu-school.bg': 'Ms Nikolova'
};

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
    '1000000012': 'Carlos Mendes',
    '9000000001': 'Radoslav Paskalev'
};

const nameToEgn = Object.fromEntries(Object.entries(egnToName).map(([egn, name]) => [name, egn]));

if (!user || user.role !== 'TEACHER') {
    window.location.href = '/';
}

// Initialize canvas and AI elements
let teacherCanvas = document.getElementById('teacherCanvas');
let tCtx = teacherCanvas ? teacherCanvas.getContext('2d') : null;
let aiStatusText = document.getElementById('aiStatusText');
let aiStatusBanner = document.getElementById('aiStatusBanner');

// Set teacher name
const teacherNameEl = document.getElementById('teacherName');
if (teacherNameEl) {
    if (isDemo && demoData) {
        teacherNameEl.textContent = demoData.teacher.name;
    } else {
        teacherNameEl.textContent = teacherNames[user.email] || user.displayName || user.email || 'Teacher';
    }
}

const supportedLangs = ['en', 'bg', 'sr', 'el', 'tr', 'ro', 'it', 'es', 'fr'];
let langIndex = 0;

function toggleLanguage() {
    langIndex = (langIndex + 1) % supportedLangs.length;
    currentLang = supportedLangs[langIndex];
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = currentLang.toUpperCase();
}

if (isDemo) {
    insertDemoBanner();
    insertDemoTeacherSections();
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
            <div class="insight-top"><h5>What to try</h5></div>
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
        <div class="section-header"><div><span class="section-eyebrow">Weekly Timetable</span><h3 class="section-title">Schedule</h3></div></div>
        <div id="demoScheduleList"></div>
    `;
    const homeworkSection = document.createElement('div');
    homeworkSection.className = 'card section-card';
    homeworkSection.id = 'demoHomeworkSection';
    homeworkSection.innerHTML = `
        <div class="section-header"><div><span class="section-eyebrow">Assignments</span><h3 class="section-title">Homework</h3></div></div>
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

let currentViewEgn = null;
let currentViewStudent = null;
let currentViewSubject = null;
let currentViewPage = 1;
let teacherTool = 'pen';
let teacherColor = '#e53e3e';
let teacherDrawing = false;
let teacherLastX = 0;
let teacherLastY = 0;

function toggleClassroomLock(isLocked) {
    socket.emit('classroom-control', { command: isLocked ? 'LOCK_SCREENS' : 'UNLOCK_SCREENS', className: '11D' });
    setAiStatus(isLocked ? 'Classroom screens locked.' : 'Classroom screens released.');
}

function startVoiceToNotes() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onstart = () => setAiStatus('Listening for notes...');
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAiStatus(`Transcribed: ${transcript.substring(0, 30)}...`);
        socket.emit('voice-note-transcribed', { transcript, subject: currentViewSubject });
    };
    recognition.start();
}

async function explainLikeIm5() {
    if (!currentViewSubject) return;
    const topic = prompt("What concept should I simplify?");
    if (!topic) return;
    setAiStatus('Simplifying concept...', 'info');
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/notebook/eli5/${encodeURIComponent(currentViewSubject)}/${encodeURIComponent(topic)}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        showEli5Modal(topic, data);
        setAiStatus('');
    } catch (err) {
        setAiStatus('Failed to simplify concept.', 'error');
    }
}

function showEli5Modal(topic, data) {
    injectEli5Styles();
    let modal = document.getElementById('eli5Modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'eli5Modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;';
        document.body.appendChild(modal);
    }
    modal.replaceChildren();
    const content = document.createElement('div');
    content.className = 'card section-card eli5-content';
    content.style.maxWidth = '500px';
    content.innerHTML = `
        <h3>ELI5: ${topic}</h3>
        <p><strong>Status:</strong> ${data.learningStatus || 'N/A'}</p>
        <p class="insight-copy" style="font-style:italic">${data.encouragement || ''}</p>
        <ul>${(data.hints || []).map(h => `<li>${h}</li>`).join('')}</ul>
        <button class="action-btn" onclick="document.getElementById('eli5Modal').style.display='none'">Close</button>
    `;
    modal.appendChild(content);
    modal.style.display = 'flex';
}

function syncStudentsToCurrentPage() {
    if (!currentViewSubject) return;
    socket.emit('force-page-sync', { subject: currentViewSubject, page: currentViewPage, className: '11D' });
    setAiStatus(`Students synced to ${currentViewSubject} Page ${currentViewPage}`);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) console.log("Teacher tab inactive.");
});

socket.on('suspicious-activity', (data) => {
    const { studentName, reason } = data;
    const alertsList = document.getElementById('aiAlertsList');
    if (alertsList) {
        const card = document.createElement('div');
        card.className = 'alert-card alert-high';
        card.innerHTML = `<h5>Suspicious Activity: ${studentName}</h5><p>${reason}</p>`;
        alertsList.prepend(card);
    }
});

function setTeacherTool(tool) {
    teacherTool = tool;
    document.getElementById('teacherPenBtn')?.classList.toggle('active', tool === 'pen');
    document.getElementById('teacherEraserBtn')?.classList.toggle('active', tool === 'eraser');
}

function setTeacherColor(color, btnId) {
    teacherColor = color;
    document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
    document.getElementById(btnId)?.classList.add('active');
}

function clearTeacherCanvas() {
    if (!tCtx) return;
    tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
    if (currentViewEgn && currentViewSubject) {
        socket.emit('clear-canvas', { studentEgn: currentViewEgn, subject: currentViewSubject, page: currentViewPage });
    }
}

async function replayLesson() {
    if (strokeHistory.length === 0 || isPlayingBack || !tCtx) return;
    isPlayingBack = true;
    tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
    const startTime = strokeHistory[0].timestamp;
    for (const stroke of strokeHistory) {
        const delay = stroke.timestamp - startTime;
        await new Promise(resolve => setTimeout(resolve, delay));
        tCtx.beginPath();
        tCtx.moveTo(stroke.x0, stroke.y0);
        tCtx.lineTo(stroke.x1, stroke.y1);
        tCtx.strokeStyle = stroke.color || '#e53e3e';
        tCtx.lineWidth = stroke.size;
        tCtx.lineCap = 'round';
        tCtx.stroke();
    }
    isPlayingBack = false;
}

function drawTeacher(x0, y0, x1, y1) {
    if (!currentViewEgn || !currentViewSubject || !tCtx) return;
    const size = document.getElementById('teacherSize')?.value || 3;
    const timestamp = Date.now();
    if (lastStrokeTime) {
        activeWritingTime += (timestamp - lastStrokeTime < 2000) ? (timestamp - lastStrokeTime) : 0;
    }
    lastStrokeTime = timestamp;
    const strokeData = {
        x0, y0, x1, y1,
        color: teacherTool === 'eraser' ? null : teacherColor,
        size, tool: teacherTool,
        studentEgn: currentViewEgn,
        subject: currentViewSubject,
        page: currentViewPage,
        timestamp
    };
    strokeHistory.push(strokeData);
    if (teacherTool === 'eraser') {
        tCtx.clearRect(x1 - 10, y1 - 10, 20, 20);
    } else {
        tCtx.beginPath();
        tCtx.moveTo(x0, y0);
        tCtx.lineTo(x1, y1);
        tCtx.strokeStyle = teacherColor;
        tCtx.lineWidth = size;
        tCtx.lineCap = 'round';
        tCtx.lineJoin = 'round';
        tCtx.stroke();
    }
    if (socket.connected) {
        socket.emit('draw-stroke', strokeData);
    } else {
        saveStrokeOffline(strokeData);
        setAiStatus('Offline: Syncing when connection returns.', 'error');
    }
}

function showSection(sectionId) {
    ['aiInsightsSection', 'notebookViewer', 'testsSection', 'gradesSection'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';
}

function sendSilentResponse(studentName, message, isPublic = false) {
    socket.emit('silent-message-response', {
        recipient: isPublic ? 'CLASS_11D' : studentName,
        content: message,
        teacherName: teacherNames[user.email] || user.displayName || 'Teacher'
    });
}

function subjectMatch(a, b) {
    return a && b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

socket.on('draw-stroke', (data) => {
    if (!tCtx) return;
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
    if (!tCtx) return;
    if (data.studentEgn === currentViewEgn &&
        subjectMatch(data.subject, currentViewSubject) &&
        parseInt(data.page) === parseInt(currentViewPage)) {
        tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
    }
});

socket.on('page-change', (data) => {
    if (!tCtx) return;
    if (data.studentEgn === currentViewEgn && subjectMatch(data.subject, currentViewSubject)) {
        currentViewPage = data.page;
        document.getElementById('notebookTitle').textContent =
            `${currentViewStudent} - ${currentViewSubject} (Page ${currentViewPage})`;
        tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
        loadTeacherPage();
    }
});
async function loadNotifications() {
    const container = document.getElementById('teacherNotifications');
    if (!container) return;
    try {
        if (isDemo && demoData) {
            container.innerHTML = demoData.notifications.slice(0, 6).map(n => `
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
        container.innerHTML = '<p class="empty-state">No notifications yet.</p>';
    } catch (error) {
        console.error('Could not load notifications:', error);
    }
}

async function loadStudentNames() {
    if (isDemo && demoData) {
        studentNames = [{ fullName: demoData.student.name, egn: '9000000001' }];
        return;
    }
    studentNames = Object.entries(egnToName).map(([egn, name]) => ({ fullName: name, egn }));
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
            demoData.grades.unshift({ subject, value, comment: comment || 'Demo grade saved.', createdAt: new Date().toISOString() });
            setGradeStatus('Grade saved (demo).');
            document.getElementById('gradeValue').value = '';
            document.getElementById('gradeComment').value = '';
            loadGradeHistory();
            loadNotifications();
            return true;
        }
        setGradeStatus('Grades not yet connected to backend.');
        return false;
    } catch (error) {
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
    const container = document.getElementById('gradeHistoryList');
    if (!container) return;
    container.innerHTML = '<p class="empty-state">Loading...</p>';
    try {
        if (isDemo && demoData) {
            const grades = demoData.grades;
            if (!grades.length) {
                container.innerHTML = '<p class="empty-state">No grades yet.</p>';
                return;
            }
            container.innerHTML = grades.map(g => `
                <div class="test-card">
                    <h5>${g.subject}: ${g.value}</h5>
                    <div class="test-meta">${g.comment || 'No comment'}</div>
                    <div class="test-meta">Saved: ${g.createdAt ? g.createdAt.replace('T', ' ') : '-'}</div>
                </div>
            `).join('');
            return;
        }
        container.innerHTML = '<p class="empty-state">No grades yet.</p>';
    } catch (error) {
        container.innerHTML = '<p class="empty-state">Failed to load grades.</p>';
    }
}

async function loadGrades() {
    showSection('gradesSection');
    await loadStudentNames();
    populateGradeStudents();
    await loadGradeHistory();
}

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'gradeStudent') loadGradeHistory();
    if (e.target && e.target.id === 'testClass') scheduleTestAutosave();
});

document.addEventListener('input', (e) => {
    if (!e.target) return;
    const gradeIds = new Set(['gradeStudent', 'gradeSubject', 'gradeValue', 'gradeComment']);
    const testIds = new Set(['testTitle', 'testSubject', 'testDescription', 'testQuestions', 'testPoints', 'testDueDate']);
    if (gradeIds.has(e.target.id)) scheduleGradeAutosave();
    if (testIds.has(e.target.id)) scheduleTestAutosave();
});

if (!isDemo) {
    socket.on('grade-updated', () => {
        if (document.getElementById('gradesSection')?.style.display === 'block') loadGradeHistory();
        loadNotifications();
    });
}

async function loadTeacherPage() {
    try {
        if (isDemo && demoData) {
            renderDemoNotebookPage(demoData.notebooks[0]);
            return;
        }
        const egn = currentViewEgn || nameToEgn[currentViewStudent] || '';
        const res = await fetch(`${BACKEND_BASE_URL}/api/notebook/student/${egn}/${encodeURIComponent(currentViewSubject)}/${currentViewPage}?t=${Date.now()}`);
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

function renderDemoNotebookPage(notebook) {
    const img = document.getElementById('notebookImage');
    img.src = '';
    img.style.display = 'none';
    if (!tCtx) return;
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

async function loadNotebooks() {
    try {
        const section = document.getElementById('notebooksSection');
        const list = document.getElementById('notebooksList');
        section.style.display = 'block';
        list.innerHTML = '';

        if (isDemo && demoData) {
            demoData.notebooks.forEach(notebook => {
                const card = document.createElement('div');
                card.className = 'notebook-card';
                card.innerHTML = `
                    <div>
                        <h4>${notebook.studentName}</h4>
                        <p>Subject: ${notebook.subject} | Page: ${notebook.page}</p>
                    </div>
                    <button class="view-btn">Preview</button>
                `;
                card.querySelector('.view-btn').addEventListener('click', () => {
                    viewNotebook('9000000001', notebook.studentName, notebook.subject);
                });
                list.appendChild(card);
            });
            return;
        }

        const response = await fetch(`${BACKEND_BASE_URL}/api/notebook/list?t=${Date.now()}`);
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

        if (uniqueNotebooks.length === 0) {
            list.innerHTML = '<p>No notebooks found.</p>';
            return;
        }

        uniqueNotebooks.forEach(notebook => {
            const studentName = notebook.studentName || 'Unknown';
            const egn = nameToEgn[studentName] || '';
            const card = document.createElement('div');
            card.className = 'notebook-card';
            card.innerHTML = `
                <div>
                    <h4>${studentName}</h4>
                    <p>Subject: ${notebook.subject} | Year: ${notebook.schoolYear}</p>
                </div>
                <button class="view-btn">View</button>
            `;
            card.querySelector('.view-btn').addEventListener('click', () => {
                viewNotebook(egn, studentName, notebook.subject);
            });
            list.appendChild(card);
        });
    } catch (error) {
        console.error('Could not load notebooks:', error);
    }
}

function viewNotebook(egn, studentName, subject) {
    currentViewEgn = egn;
    currentViewStudent = studentName;
    currentViewSubject = subject;
    currentViewPage = 1;
    strokeHistory = [];

    document.getElementById('notebooksSection').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'block';
    document.getElementById('notebookTitle').textContent = `${studentName} - ${subject} (Page 1)`;
    document.getElementById('liveBadge').style.display = 'none';

    const wrapper = document.getElementById('notebookCanvasWrapper');
    const isMaths = subject.toLowerCase() === 'maths';
    wrapper.className = 'notebook-canvas-wrapper ' + (isMaths ? 'squared' : 'lined');

    teacherCanvas = document.getElementById('teacherCanvas');
    tCtx = teacherCanvas ? teacherCanvas.getContext('2d') : null;
    if (teacherCanvas) {
        teacherCanvas.width = wrapper.clientWidth;
        teacherCanvas.height = wrapper.clientHeight;
    }
    if (tCtx) tCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);

    attachTeacherCanvasEvents();
    loadTeacherPage();
}

function backToList() {
    currentViewEgn = null;
    currentViewStudent = null;
    currentViewSubject = null;
    currentViewPage = 1;
    document.getElementById('liveBadge').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'none';
    document.getElementById('notebooksSection').style.display = 'block';
}

function attachTeacherCanvasEvents() {
    if (!teacherCanvas) return;
    const newCanvas = teacherCanvas.cloneNode(true);
    teacherCanvas.parentNode.replaceChild(newCanvas, teacherCanvas);
    teacherCanvas = newCanvas;
    tCtx = teacherCanvas.getContext('2d');

    teacherCanvas.addEventListener('mousedown', (e) => {
        if (!currentViewEgn) return;
        teacherDrawing = true;
        [teacherLastX, teacherLastY] = [e.offsetX, e.offsetY];
    });
    teacherCanvas.addEventListener('mousemove', (e) => {
        if (!teacherDrawing) return;
        drawTeacher(teacherLastX, teacherLastY, e.offsetX, e.offsetY);
        [teacherLastX, teacherLastY] = [e.offsetX, e.offsetY];
    });
    teacherCanvas.addEventListener('mouseup', () => { teacherDrawing = false; });
    teacherCanvas.addEventListener('mouseout', () => { teacherDrawing = false; });

    teacherCanvas.addEventListener('touchstart', (e) => {
        if (!currentViewEgn) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = teacherCanvas.getBoundingClientRect();
        teacherDrawing = true;
        teacherLastX = touch.clientX - rect.left;
        teacherLastY = touch.clientY - rect.top;
    }, { passive: false });
    teacherCanvas.addEventListener('touchmove', (e) => {
        if (!teacherDrawing) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = teacherCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        drawTeacher(teacherLastX, teacherLastY, x, y);
        [teacherLastX, teacherLastY] = [x, y];
    }, { passive: false });
    teacherCanvas.addEventListener('touchend', () => { teacherDrawing = false; });
    teacherCanvas.addEventListener('touchcancel', () => { teacherDrawing = false; });
}
function formatPercent(value) { return `${Number(value || 0).toFixed(1)}%`; }
function formatSeconds(value) { return `${Math.round(value || 0)}s`; }
function riskBadgeClass(level) { return `risk-badge risk-${String(level || 'low').toLowerCase()}`; }

function setAiStatus(message, type = 'info') {
    if (aiStatusText) aiStatusText.textContent = message || '';
    const assistantEl = document.getElementById('assistant-techie');
    if (!message) {
        if (aiStatusBanner) { aiStatusBanner.style.display = 'none'; aiStatusBanner.className = 'ai-status-banner'; }
        if (assistantEl) assistantEl.classList.remove('thinking');
        return;
    }
    if (assistantEl) assistantEl.classList.add('thinking');
    if (aiStatusBanner) {
        aiStatusBanner.textContent = message;
        aiStatusBanner.className = `ai-status-banner${type === 'error' ? ' error' : ''}`;
        aiStatusBanner.style.display = 'block';
    }
}

function renderHeatmap(students) {
    const container = document.getElementById('classroomHeatmap');
    if (!container) return;
    container.replaceChildren();
    students.forEach(student => {
        const cell = document.createElement('div');
        cell.className = `heatmap-cell status-${student.riskLevel.toLowerCase()}`;
        const tooltip = document.createElement('span');
        tooltip.className = 'heatmap-tooltip';
        tooltip.textContent = `${student.studentName}: ${student.riskLevel} Risk`;
        cell.appendChild(tooltip);
        cell.onclick = () => viewNotebook(nameToEgn[student.studentName] || '', student.studentName, currentViewSubject || 'Maths');
        container.appendChild(cell);
    });
}

function renderOverview(overview) {
    const grid = document.getElementById('aiOverviewGrid');
    if (!grid) return;
    const metrics = [
        { label: 'Tracked Tasks', value: overview.totalTasks ?? 0 },
        { label: 'Accuracy', value: formatPercent(overview.accuracyRate) },
        { label: 'Average Time', value: formatSeconds(overview.averageTimeSpentSeconds) },
        { label: 'Average Attempts', value: Number(overview.averageAttempts ?? 0).toFixed(1) },
        { label: 'Struggling Students', value: overview.strugglingStudentsCount ?? 0 },
        { label: 'Attention Alerts', value: overview.attentionAlertsCount ?? 0 }
    ];
    grid.innerHTML = metrics.map(m => `
        <div class="metric-card">
            <span class="metric-label">${m.label}</span>
            <strong class="metric-value">${m.value}</strong>
        </div>
    `).join('');
}

function renderStudents(students) {
    const container = document.getElementById('aiStudentsList');
    if (!container) return;
    if (!students || !students.length) {
        container.innerHTML = '<p class="empty-state">No students currently flagged for attention.</p>';
        return;
    }
    container.innerHTML = students.map(s => `
        <div class="insight-card">
            <div class="insight-top">
                <div>
                    <h5>${s.studentName}</h5>
                    <p>${s.className} • ${s.adaptiveRecommendation.replaceAll('_', ' ')}</p>
                </div>
                <span class="${riskBadgeClass(s.riskLevel)}">${s.riskLevel}</span>
            </div>
            <p class="insight-copy">${s.recommendedAction}</p>
            <p class="insight-weaknesses"><strong>Weakness areas:</strong> ${s.weaknessAreas?.join(', ') || 'None'}</p>
        </div>
    `).join('');
}

function renderAlerts(alerts) {
    const container = document.getElementById('aiAlertsList');
    if (!container) return;
    if (!alerts || !alerts.length) {
        container.innerHTML = '<p class="empty-state">No active alerts right now.</p>';
        return;
    }
    container.innerHTML = alerts.map(a => `
        <div class="alert-card alert-${String(a.severity || 'medium').toLowerCase()}">
            <div class="insight-top">
                <h5>${a.title}</h5>
                <span class="${riskBadgeClass(a.severity)}">${a.severity}</span>
            </div>
            <p class="insight-copy">${a.message}</p>
        </div>
    `).join('');
}

function renderTopics(topics) {
    const container = document.getElementById('aiTopicsList');
    if (!container) return;
    if (!topics || !topics.length) {
        container.innerHTML = '<p class="empty-state">No topic analytics available yet.</p>';
        return;
    }
    container.innerHTML = topics.map(t => `
        <div class="topic-row">
            <div><h5>${t.label}</h5><p>${t.subject}</p></div>
            <div class="topic-metrics">
                <span>${formatPercent(t.accuracyRate)} accuracy</span>
                <span class="${riskBadgeClass(t.difficultyLevel)}">${t.difficultyLevel}</span>
            </div>
            <p class="insight-copy">${t.teacherAction}</p>
        </div>
    `).join('');
}

async function loadAiInsights() {
    showSection('aiInsightsSection');
    if (isDemo) {
        renderOverview({ totalTasks: 42, accuracyRate: 0.82, averageTimeSpentSeconds: 64, averageAttempts: 1.6, strugglingStudentsCount: 1, attentionAlertsCount: 2 });
        renderStudents([{ studentName: demoData.student.name, className: demoData.student.className, adaptiveRecommendation: 'FOCUS_REVIEW', riskLevel: 'medium', accuracyRate: 0.68, averageTimeSpentSeconds: 85, averageAttempts: 2.1, recommendedAction: 'Schedule a quick recap on factoring.', weaknessAreas: ['Quadratic factoring', 'Word problems'] }]);
        renderAlerts([{ title: 'Physics Momentum', severity: 'medium', message: 'Several students spend extra time on momentum problems.' }]);
        renderTopics([{ label: 'Quadratic Equations', subject: 'Maths', accuracyRate: 0.72, averageTimeSpentSeconds: 88, averageAttempts: 2.4, difficultyLevel: 'medium', teacherAction: 'Re-teach factoring with a short guided example.' }]);
        setAiStatus('Demo AI data loaded for exploration.');
        return;
    }
    setAiStatus('Fetching class performance insights...', 'info');
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/ai/teacher/overview`);
        if (res.ok) {
            const data = await res.json();
            renderOverview(data.overview || {});
            renderHeatmap(data.strugglingStudents || []);
            renderStudents(data.strugglingStudents || []);
            renderAlerts(data.alerts || []);
            renderTopics(data.topicInsights || []);
            setAiStatus('');
        } else {
            setAiStatus('Failed to load AI Insights.', 'error');
        }
    } catch (error) {
        setAiStatus('Connection error while loading insights.', 'error');
    }
}

async function loadClasses() {
    const select = document.getElementById('testClass');
    if (!select) return;
    select.innerHTML = '';
    if (isDemo) {
        const option = document.createElement('option');
        option.value = demoData.student.className;
        option.textContent = demoData.student.className;
        select.appendChild(option);
        return;
    }
    const option = document.createElement('option');
    option.value = '11D';
    option.textContent = '11D';
    select.appendChild(option);
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

    if (!title || !className) { setTestStatus('Title and class are required.'); return false; }
    const questions = questionsInput ? questionsInput.split('\n').map(q => q.trim()).filter(Boolean) : [];

    try {
        setTestStatus('Creating test...');
        if (isDemo && demoData) {
            const id = Math.floor(Date.now() / 1000);
            demoData.teacherTests.unshift({ id, title, subject, assignments: [{ className, dueDate }] });
            demoData.tests.unshift({ testId: id, title, subject, dueDate, questionsJson: JSON.stringify(questions), status: 'ASSIGNED', score: null, feedback: null });
            setTestStatus('Test created and assigned (demo).');
            ['testTitle','testSubject','testDescription','testQuestions','testPoints'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            loadTests();
            return true;
        }
        setTestStatus('Tests not yet connected to backend.');
        return false;
    } catch (error) {
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
        const hash = `${title}|${className}|${document.getElementById('testSubject').value}`;
        if (hash === lastTestHash) return;
        const success = await createTest();
        if (success) lastTestHash = hash;
    }, 1200);
}

function renderTests(tests) {
    const list = document.getElementById('testsList');
    if (!list) return;
    if (!tests.length) { list.innerHTML = '<p class="empty-state">No tests created yet.</p>'; return; }
    list.innerHTML = tests.map(test => {
        const assignments = test.assignments || [];
        const assignmentText = assignments.length ? assignments.map(a => `${a.className}${a.dueDate ? ` • due ${a.dueDate}` : ''}`).join(', ') : 'Not assigned yet';
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

async function loadSubmissions(testId) {
    const panel = document.getElementById('submissionsPanel');
    const list = document.getElementById('submissionsList');
    if (!panel || !list) return;
    panel.style.display = 'block';
    list.innerHTML = '<p class="empty-state">Loading submissions...</p>';
    try {
        if (isDemo && demoData) {
            const submissions = demoData.testSubmissions[testId] || [];
            if (!submissions.length) { list.innerHTML = '<p class="empty-state">No submissions yet.</p>'; return; }
            list.innerHTML = submissions.map(sub => `
                <div class="submission-card">
                    <strong>Student: ${demoData.student.name}</strong>
                    <div class="test-meta">Status: ${sub.status || 'SUBMITTED'}</div>
                    <pre class="test-meta">${sub.answersJson || ''}</pre>
                    <div class="test-row">
                        <input type="number" min="0" placeholder="Score" id="score-${sub.id}" value="${sub.score ?? ''}">
                        <input type="text" placeholder="Feedback" id="feedback-${sub.id}" value="${sub.feedback ?? ''}">
                        <button class="action-btn" onclick="gradeSubmission(${sub.id}, '${demoData.student.name}')">Grade</button>
                    </div>
                </div>
            `).join('');
            return;
        }
        list.innerHTML = '<p class="empty-state">No submissions yet.</p>';
    } catch (error) {
        list.innerHTML = '<p class="empty-state">Failed to load submissions.</p>';
    }
}

async function gradeSubmission(submissionId) {
    if (isDemo && demoData) {
        const submissions = Object.values(demoData.testSubmissions).flat();
        const sub = submissions.find(s => s.id === submissionId);
        if (sub) { sub.status = 'GRADED'; sub.feedback = 'Demo feedback saved.'; }
        return;
    }
}

async function loadTests() {
    showSection('testsSection');
    await loadClasses();
    try {
        if (isDemo && demoData) { renderTests(demoData.teacherTests || []); return; }
        renderTests([]);
    } catch (error) {
        console.error('Could not load tests:', error);
    }
}

loadNotifications();
createAssistant();