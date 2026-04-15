const user = JSON.parse(localStorage.getItem('user'));
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io('https://techdesk-frontend.onrender.com');
const token = localStorage.getItem('token');
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);
let studentTestsCache = [];
let studentHomeworkCache = [];
let studentSubjectsCache = [];
let activeTestSession = null;
let testTool = 'pen';
let testDrawing = false;
let testLastX = 0;
let testLastY = 0;
let testGuardEnabled = false;
const testCanvas = document.getElementById('testAnswerCanvas');
const testCtx = testCanvas ? testCanvas.getContext('2d') : null;

function authHeaders(extra = {}) {
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

if (!user || user.role !== 'STUDENT') {
    window.location.href = '/';
}

if (isDemo && demoData) {
    document.getElementById('studentName').textContent = demoData.student.name;
    document.getElementById('studentClass').textContent = demoData.student.className;
} else {
    document.getElementById('studentName').textContent = user.displayName || 'Student';
    document.getElementById('studentClass').textContent = user.className || '-';
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
        <p class="insight-copy"><strong>Features:</strong> Grades, Attendance, Messages, Schedule, Homework, Tests, Notebook.</p>
        <div class="insight-card">
            <div class="insight-top">
                <h5>What to try</h5>
            </div>
            <p class="insight-copy">Open subjects, review grades, submit a demo test, and check attendance.</p>
        </div>
    `;
    hero.insertAdjacentElement('afterend', banner);
}

function insertDemoStudentSections() {
    renderDemoSchedule();
    renderDemoHomework();
}

function renderDemoSchedule() {
    const container = document.getElementById('scheduleList');
    if (!container || !demoData?.schedule) return;
    container.innerHTML = Object.entries(demoData.schedule.week).map(([day, items]) => `
        <div class="test-card">
            <h5>${day}</h5>
            ${items.map(item => `<div class="test-meta">${item.time} • ${item.subject} (${item.room}) • ${item.teacher}</div>`).join('')}
        </div>
    `).join('');
}

function renderDemoHomework() {
    const container = document.getElementById('homeworkList');
    if (!container || !demoData?.homework) return;
    container.innerHTML = demoData.homework.map(hw => `
        <div class="test-card">
            <h5>${hw.subject}: ${hw.title}</h5>
            <div class="test-meta">Due ${hw.dueDate} • ${hw.status}</div>
            <div class="test-meta">${hw.details}</div>
        </div>
    `).join('');
}

function renderHomeworkFromCache() {
    const container = document.getElementById('homeworkList');
    if (!container) return;
    if (!studentHomeworkCache.length) {
        container.innerHTML = '<p class="empty-state">No homework data yet.</p>';
        return;
    }
    container.innerHTML = studentHomeworkCache.map(hw => `
        <div class="test-card">
            <h5>${hw.subject}: ${hw.title}</h5>
            <div class="test-meta">${hw.dueDate ? `Due ${hw.dueDate}` : 'No deadline'} • ${hw.status || 'Assigned'}</div>
            <div class="test-meta">${hw.details || 'Review notes and prepare your submission.'}</div>
        </div>
    `).join('');
}

function renderScheduleFallback() {
    const container = document.getElementById('scheduleList');
    if (!container) return;
    if (!studentSubjectsCache.length) {
        container.innerHTML = '<p class="empty-state">No schedule data yet.</p>';
        return;
    }
    container.innerHTML = `
        <div class="test-card">
            <h5>Active Subjects</h5>
            ${studentSubjectsCache.slice(0, 8).map((subject, index) => `<div class="test-meta">Period ${index + 1} • ${subject.name}</div>`).join('')}
            <div class="test-meta">Full timetable is provided by the school schedule module.</div>
        </div>
    `;
}

async function loadSubjects() {
    try {
        if (isDemo && demoData) {
            const subjects = demoData.subjects;
            studentSubjectsCache = subjects || [];
            const grid = document.getElementById('subjectsGrid');
            grid.innerHTML = '';
            subjects.forEach(subject => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${subject.name}</h3>
                    <p>Take lessons: ${subject.name}</p>
                    <button class="subject-btn" onclick="openSubject(${subject.id})">
                        📖 Textbook + Notebook
                    </button>
                `;
                grid.appendChild(card);
            });
            return;
        }
        const response = await fetch(`${BACKEND_BASE_URL}/api/subject/all`, {
            headers: authHeaders()
        });
        const subjects = await response.json();
        studentSubjectsCache = subjects || [];
        const grid = document.getElementById('subjectsGrid');
        grid.innerHTML = '';

        if (subjects.length === 0) {
            grid.innerHTML = '<p>No subjects available yet.</p>';
            return;
        }

        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${subject.name}</h3>
                <p>Take lessons: ${subject.name}</p>
                <button class="subject-btn" onclick="openSubject(${subject.id})">
                    📖 Textbook + Notebook
                </button>
            `;
            grid.appendChild(card);
        });
        renderScheduleFallback();
    } catch (error) {
        console.error('Could not load subjects:', error);
    }
}

async function loadAttendanceSummary() {
    try {
        if (isDemo && demoData) {
            const records = demoData.attendance;
            const present = records.filter(r => r.status === 'PRESENT').length;
            const absent = records.filter(r => r.status === 'ABSENT_UNEXCUSED' || r.status === 'ABSENT_EXCUSED').length;
            const total = records.length;
            const latest = records.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            const summary = document.getElementById('attendanceSummary');
            if (summary) summary.textContent = total ? `${total} records, ${absent} absent` : 'No records yet';

            document.getElementById('attendanceTotal').textContent = total || '-';
            document.getElementById('attendancePresent').textContent = total ? present : '-';
            document.getElementById('attendanceAbsent').textContent = total ? absent : '-';
            document.getElementById('attendanceLatest').textContent = latest ? latest.status : '-';
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/attendance/me?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const records = res.ok ? await res.json() : [];
        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT_UNEXCUSED' || r.status === 'ABSENT_EXCUSED').length;
        const total = records.length;
        const latest = records.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const summary = document.getElementById('attendanceSummary');
        if (summary) summary.textContent = total ? `${total} records, ${absent} absent` : 'No records yet';

        document.getElementById('attendanceTotal').textContent = total || '-';
        document.getElementById('attendancePresent').textContent = total ? present : '-';
        document.getElementById('attendanceAbsent').textContent = total ? absent : '-';
        document.getElementById('attendanceLatest').textContent = latest ? latest.status : '-';
    } catch (error) {
        console.error('Could not load attendance summary:', error);
    }
}

const AI_TRACKER_URL = `${BACKEND_BASE_URL}/api/ai/task-data`;

function sendAiTaskData(taskData) {
    if (isDemo) return;
    const payload = JSON.stringify(taskData);

    try {
        fetch(AI_TRACKER_URL, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: payload,
            keepalive: true
        })
            .then((response) => {
                if (!response.ok) {
                    console.warn('AI task tracking returned non-ok status:', response.status);
                    return;
                }

                console.log('AI task tracking dispatched successfully');
            })
            .catch((error) => {
                console.error('AI task tracking request failed (silent):', error);
            });
    } catch (error) {
        console.error('AI task tracking request failed (silent):', error);
    }
}

function trackTaskCompletion(taskData) {
    const payload = {
        studentId: user.displayName || 'Student',
        completed: true,
        skipped: false,
        className: user.className || localStorage.getItem('currentClassName') || null,
        notebookSubject: localStorage.getItem('currentNotebookSubject') || null,
        notebookPage: localStorage.getItem('currentNotebookPage') || null,
        ...taskData
    };

    if (!payload.subject) {
        const subjectId = localStorage.getItem('currentSubject');
        const subjectCard = document.querySelector(`[onclick="openSubject(${subjectId})"] h3`);
        payload.subject = subjectCard ? subjectCard.textContent.trim() : null;
    }

    sendAiTaskData(payload);
}

window.trackTaskCompletion = trackTaskCompletion;

function openSubject(subjectId) {
    localStorage.setItem('currentSubject', subjectId);
    window.location.href = '/notebook';
}

function quickOpenNotebook() {
    switchStudentPanel('subjects');
}

function switchStudentPanel(panelName) {
    const panels = document.querySelectorAll('.student-panel[data-panel]');
    const buttons = document.querySelectorAll('.student-tab[data-panel-btn]');
    let found = false;

    panels.forEach((panel) => {
        const isActive = panel.dataset.panel === panelName;
        panel.classList.toggle('active', isActive);
        if (isActive) found = true;
    });

    buttons.forEach((button) => {
        const isActive = button.dataset.panelBtn === panelName;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (!found && panelName !== 'subjects') {
        switchStudentPanel('subjects');
    }
}

function safeParseQuestions(questionsJson) {
    if (!questionsJson) return [];
    try {
        const parsed = JSON.parse(questionsJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function resizeTestCanvas() {
    if (!testCanvas || !testCtx) return;
    const wrap = document.querySelector('.test-canvas-wrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const snapshot = testCanvas.toDataURL('image/png');
    testCanvas.width = Math.max(1, Math.floor(rect.width));
    testCanvas.height = Math.max(1, Math.floor(rect.height));
    const img = new Image();
    img.onload = () => testCtx.drawImage(img, 0, 0, testCanvas.width, testCanvas.height);
    img.src = snapshot;
}

function renderTestQuestions(test) {
    const panel = document.getElementById('testQuestionsPanel');
    if (!panel) return;
    const questions = safeParseQuestions(test.questionsJson);
    panel.innerHTML = `
        <h4>${test.title}</h4>
        <p class="test-workspace-meta">${test.subject || 'General'}${test.dueDate ? ` • Due ${test.dueDate}` : ''}</p>
        ${questions.length
            ? `<ol>${questions.map(q => `<li>${q}</li>`).join('')}</ol>`
            : '<p>No question list provided. Use teacher instructions.</p>'}
    `;
}

async function requestWorkspaceFullscreen() {
    const target = document.getElementById('testWorkspaceShell');
    if (!target || document.fullscreenElement) return;
    try {
        await target.requestFullscreen();
    } catch {
        // Browser may block without direct user gesture.
    }
}

function enableTestGuard() {
    testGuardEnabled = true;
    const guard = document.getElementById('testGuardStatus');
    if (guard) guard.textContent = 'Fullscreen lock: on';
}

function disableTestGuard() {
    testGuardEnabled = false;
}

function testGuardKeydown(event) {
    if (!testGuardEnabled) return;
    const key = String(event.key || '').toLowerCase();
    const blocked = key === 'f5' || key === 'escape' ||
        ((event.ctrlKey || event.metaKey) && ['r', 'w', 't', 'n', 'l'].includes(key)) ||
        (event.altKey && key === 'arrowleft');
    if (blocked) {
        event.preventDefault();
        event.stopPropagation();
    }
}

function testGuardBeforeUnload(event) {
    if (!testGuardEnabled) return;
    event.preventDefault();
    event.returnValue = '';
}

function setTestTool(tool) {
    testTool = tool === 'pen' ? 'pen' : 'pen';
    document.getElementById('testPenBtn')?.classList.add('active');
}

function clearTestCanvas() {
    if (!testCanvas || !testCtx) return;
    testCtx.clearRect(0, 0, testCanvas.width, testCanvas.height);
}

function drawTestStroke(x0, y0, x1, y1) {
    if (!testCtx) return;
    const size = parseInt(document.getElementById('testBrushSize')?.value || '3', 10);
    testCtx.beginPath();
    testCtx.moveTo(x0, y0);
    testCtx.lineTo(x1, y1);
    testCtx.strokeStyle = '#0f172a';
    testCtx.lineWidth = size;
    testCtx.lineCap = 'round';
    testCtx.lineJoin = 'round';
    testCtx.stroke();
}

function setupTestCanvasEvents() {
    if (!testCanvas) return;
    testCanvas.addEventListener('pointerdown', (event) => {
        if (!activeTestSession) return;
        testDrawing = true;
        testLastX = event.offsetX;
        testLastY = event.offsetY;
    });
    testCanvas.addEventListener('pointermove', (event) => {
        if (!testDrawing) return;
        drawTestStroke(testLastX, testLastY, event.offsetX, event.offsetY);
        testLastX = event.offsetX;
        testLastY = event.offsetY;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => {
        testCanvas.addEventListener(type, () => { testDrawing = false; });
    });
}

async function openFullscreenTest(testId) {
    const test = (studentTestsCache || []).find(t => Number(t.testId) === Number(testId));
    if (!test) return;
    activeTestSession = test;
    clearTestCanvas();
    document.getElementById('testExtraNote').value = '';
    document.getElementById('testWorkspaceTitle').textContent = test.title || 'Test Workspace';
    document.getElementById('testWorkspaceMeta').textContent = `${test.subject || 'General'}${test.dueDate ? ` • Due ${test.dueDate}` : ''}`;
    renderTestQuestions(test);
    document.getElementById('testWorkspaceOverlay').classList.add('active');
    document.getElementById('testWorkspaceOverlay').setAttribute('aria-hidden', 'false');
    document.body.classList.add('test-lock-mode');
    enableTestGuard();
    resizeTestCanvas();
    await requestWorkspaceFullscreen();
}

async function closeFullscreenTest() {
    disableTestGuard();
    activeTestSession = null;
    document.getElementById('testWorkspaceOverlay').classList.remove('active');
    document.getElementById('testWorkspaceOverlay').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('test-lock-mode');
    if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch {}
    }
}

async function submitFullscreenTest() {
    if (!activeTestSession) return;
    const canvasDataUrl = testCanvas ? testCanvas.toDataURL('image/jpeg', 0.72) : null;
    const note = document.getElementById('testExtraNote')?.value?.trim() || '';
    const answersJson = JSON.stringify({
        mode: 'canvas_test',
        note,
        canvasDataUrl,
        submittedAt: new Date().toISOString()
    });
    await submitTest(activeTestSession.testId, answersJson, true);
}

function todayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function updateLearningFocus() {
    const testsSoon = studentTestsCache.filter(t => t.dueDate && t.dueDate <= addDaysIso(7) && t.status !== 'GRADED').length;
    const homeworkTomorrow = studentHomeworkCache.filter(h => h.dueDate === addDaysIso(1)).length;
    const studyLoad = testsSoon + homeworkTomorrow;

    const subjectLoad = new Map();
    studentTestsCache.forEach(t => {
        if (!t.subject) return;
        subjectLoad.set(t.subject, (subjectLoad.get(t.subject) || 0) + 1);
    });
    studentHomeworkCache.forEach(h => {
        if (!h.subject) return;
        subjectLoad.set(h.subject, (subjectLoad.get(h.subject) || 0) + 1);
    });
    let priority = 'Balanced review';
    let max = 0;
    subjectLoad.forEach((count, subject) => {
        if (count > max) {
            max = count;
            priority = subject;
        }
    });

    const elTests = document.getElementById('focusTestsSoon');
    const elHomework = document.getElementById('focusHomeworkTomorrow');
    const elLoad = document.getElementById('focusStudyLoad');
    const elPriority = document.getElementById('focusPriority');
    if (elTests) elTests.textContent = String(testsSoon);
    if (elHomework) elHomework.textContent = String(homeworkTomorrow);
    if (elLoad) elLoad.textContent = studyLoad > 0 ? `${studyLoad} tasks` : 'Light day';
    if (elPriority) elPriority.textContent = priority;
}

function botMessage(text, fromUser = false) {
    const body = document.getElementById('studyBotBody');
    if (!body) return;
    const div = document.createElement('div');
    div.className = `study-bot-msg${fromUser ? ' user' : ''}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function resolveStudyBot(questionRaw) {
    const q = String(questionRaw || '').toLowerCase().trim();
    if (!q) return 'Ask about tests soon, homework tomorrow, study load, or what to focus on.';

    const cheatingPattern = /(препис|шпор|измам|cheat|copy answers|hack|bypass|solve my exam)/i;
    if (cheatingPattern.test(q)) {
        return 'No. I cannot help with cheating. I can only help with planning: tests, homework, and study focus.';
    }

    const testsSoon = studentTestsCache.filter(t => t.dueDate && t.dueDate <= addDaysIso(7) && t.status !== 'GRADED');
    const homeworkTomorrow = studentHomeworkCache.filter(h => h.dueDate === addDaysIso(1));

    if (/(test|изпит|тест)/i.test(q) && /(soon|скоро|предстои|next|кога)/i.test(q) || q === 'tests') {
        if (!testsSoon.length) return 'No tests in the next 7 days. Keep light revision.';
        return `You have ${testsSoon.length} test(s) soon: ${testsSoon.slice(0, 3).map(t => `${t.title} (${t.dueDate || 'no date'})`).join(', ')}.`;
    }

    if (/(homework|домаш)/i.test(q) || q === 'homework') {
        if (!homeworkTomorrow.length) return 'No homework due tomorrow based on current data.';
        return `Homework for tomorrow: ${homeworkTomorrow.map(h => `${h.subject}: ${h.title}`).join('; ')}.`;
    }

    if (/(focus|наблег|приоритет|what should i study|на какво)/i.test(q) || q === 'focus') {
        updateLearningFocus();
        const priority = document.getElementById('focusPriority')?.textContent || 'Balanced review';
        return `Focus first on: ${priority}. Then do one short review session for your next due test.`;
    }

    if (/(how much|колко|study load|уча)/i.test(q)) {
        const load = document.getElementById('focusStudyLoad')?.textContent || 'Light day';
        return `Current study load: ${load}.`;
    }

    return 'No. I answer only basic study planning: tests soon, homework tomorrow, study load, and focus priority.';
}

function toggleStudyBot() {
    const panel = document.getElementById('studyBotPanel');
    if (!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function askStudyBotQuick(type) {
    const map = {
        tests: 'tests',
        homework: 'homework',
        focus: 'focus'
    };
    const prompt = map[type] || type;
    botMessage(prompt, true);
    botMessage(resolveStudyBot(prompt), false);
}

function askStudyBot() {
    const input = document.getElementById('studyBotInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    botMessage(text, true);
    botMessage(resolveStudyBot(text), false);
    input.value = '';
}

window.toggleStudyBot = toggleStudyBot;
window.askStudyBot = askStudyBot;
window.askStudyBotQuick = askStudyBotQuick;
window.quickOpenNotebook = quickOpenNotebook;
window.switchStudentPanel = switchStudentPanel;

if (isDemo) {
    insertDemoBanner();
    insertDemoStudentSections();
}

loadSubjects();
loadAttendanceSummary();
loadStudentTests();
loadStudentGrades();
loadStudentNotifications();
renderScheduleFallback();
renderHomeworkFromCache();
switchStudentPanel('home');

if (!isDemo) {
    socket.on('attendance-updated', (data) => {
        if (data?.studentName && data.studentName === user.displayName) {
            loadAttendanceSummary();
        }
    });

    socket.on('test-assigned', () => {
        loadStudentTests();
    });

    socket.on('test-graded', (data) => {
        if (data?.studentName && data.studentName === user.displayName) {
            loadStudentTests();
        }
    });

    socket.on('grade-updated', (data) => {
        if (data?.studentName && data.studentName === user.displayName) {
            loadStudentGrades();
            loadStudentNotifications();
        }
    });
}

function renderStudentTests(tests) {
    const list = document.getElementById('studentTestsList');
    if (!list) return;
    if (!tests.length) {
        list.innerHTML = '<p class="empty-state">No tests assigned yet.</p>';
        return;
    }

    list.innerHTML = tests.map(test => {
        let questions = [];
        if (test.questionsJson) {
            try {
                questions = JSON.parse(test.questionsJson);
            } catch (e) {
                questions = [];
            }
        }
        const due = test.dueDate ? `Due ${test.dueDate}` : 'No deadline';
        const status = test.status || 'ASSIGNED';
        const disabled = status !== 'ASSIGNED' ? 'disabled' : '';
        return `
            <div class="test-card">
                <h5>${test.title}</h5>
                <div class="test-meta">${test.subject || 'General'} • ${due}</div>
                <div class="test-meta">Status: ${status}${test.score !== null && test.score !== undefined ? ` • Score: ${test.score}` : ''}</div>
                ${test.feedback ? `<div class="test-meta">Feedback: ${test.feedback}</div>` : ''}
                <div class="test-meta">Questions:</div>
                <ul class="test-meta">
                    ${questions.map(q => `<li>${q}</li>`).join('')}
                </ul>
                <textarea class="student-answer" id="answer-${test.testId}" placeholder="Type your answers here..."></textarea>
                <div class="test-actions">
                    <button class="action-btn secondary-btn" onclick="openFullscreenTest(${test.testId})" ${disabled}>Open Fullscreen Test</button>
                    <button class="action-btn" onclick="submitTest(${test.testId})" ${disabled}>Submit</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderUpcomingTests(tests) {
    const list = document.getElementById('testsList');
    if (!list) return;
    if (!tests.length) {
        list.innerHTML = '<li>No upcoming tests</li>';
        return;
    }
    list.innerHTML = tests.map(test => `<li>${test.title} • ${test.dueDate || 'No deadline'}</li>`).join('');
}

async function loadStudentTests() {
    try {
        if (isDemo && demoData) {
            studentTestsCache = demoData.tests || [];
            studentHomeworkCache = demoData.homework || [];
            renderStudentTests(studentTestsCache);
            renderUpcomingTests(studentTestsCache);
            updateLearningFocus();
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/student/me?t=${Date.now()}`, {
            headers: authHeaders()
        });
        const tests = res.ok ? await res.json() : [];
        studentTestsCache = tests;
        studentHomeworkCache = (tests || [])
            .filter(t => t.dueDate)
            .map(t => ({
                subject: t.subject || 'General',
                title: `Prepare for ${t.title}`,
                dueDate: t.dueDate,
                status: t.status || 'ASSIGNED'
            }));
        renderStudentTests(studentTestsCache);
        renderUpcomingTests(studentTestsCache);
        updateLearningFocus();
        renderHomeworkFromCache();
    } catch (error) {
        console.error('Could not load student tests:', error);
        updateLearningFocus();
    }
}

async function submitTest(testId, preparedAnswersJson = null, closeWorkspace = false) {
    const answersField = document.getElementById(`answer-${testId}`);
    const answersJson = preparedAnswersJson || JSON.stringify({ answer: answersField ? answersField.value : '' });
    try {
        if (isDemo && demoData) {
            const test = demoData.tests.find(t => t.testId === testId);
            if (test) {
                test.status = 'SUBMITTED';
                test.feedback = 'Submission received (demo).';
            }
            if (closeWorkspace) await closeFullscreenTest();
            loadStudentTests();
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/${testId}/submit`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ answersJson })
        });
        if (!res.ok) throw new Error(`Submit failed ${res.status}`);
        await res.json();
        socket.emit('test-submitted', { testId, studentName: user.displayName });
        if (closeWorkspace) await closeFullscreenTest();
        loadStudentTests();
    } catch (error) {
        console.error('Could not submit test:', error);
    }
}

window.loadStudentTests = loadStudentTests;
window.submitTest = submitTest;
window.openFullscreenTest = openFullscreenTest;
window.submitFullscreenTest = submitFullscreenTest;
window.setTestTool = setTestTool;
window.clearTestCanvas = clearTestCanvas;

async function loadStudentGrades() {
    const list = document.getElementById('studentGradesList');
    const averages = document.getElementById('studentAverages');
    if (!list || !averages) return;
    list.innerHTML = '<p class="empty-state">Loading grades...</p>';
    averages.innerHTML = '';

    try {
        if (isDemo && demoData) {
            const grades = demoData.grades;
            const avg = demoData.averages;

            if (!grades.length) {
                list.innerHTML = '<p class="empty-state">No grades yet.</p>';
            } else {
                list.innerHTML = grades.map(g => `
                    <div class="test-card">
                        <h5>${g.subject}: ${g.value}</h5>
                        <div class="test-meta">${g.comment || 'No comment'}</div>
                        <div class="test-meta">Added: ${g.createdAt ? g.createdAt.replace('T', ' ') : '-'}</div>
                    </div>
                `).join('');
            }

            const avgEntries = Object.entries(avg);
            if (avgEntries.length) {
                averages.innerHTML = avgEntries.map(([subject, value]) => `
                    <div class="metric-card">
                        <span class="metric-label">${subject}</span>
                        <strong class="metric-value">${Number(value).toFixed(2)}</strong>
                    </div>
                `).join('');
            }
            return;
        }
        const [gradesRes, avgRes] = await Promise.all([
            fetch(`${BACKEND_BASE_URL}/api/grades/student/me?t=${Date.now()}`, { headers: authHeaders() }),
            fetch(`${BACKEND_BASE_URL}/api/grades/student/me/averages?t=${Date.now()}`, { headers: authHeaders() })
        ]);
        const grades = gradesRes.ok ? await gradesRes.json() : [];
        const avg = avgRes.ok ? await avgRes.json() : {};

        if (!grades.length) {
            list.innerHTML = '<p class="empty-state">No grades yet.</p>';
        } else {
            list.innerHTML = grades.map(g => `
                <div class="test-card">
                    <h5>${g.subject}: ${g.value}</h5>
                    <div class="test-meta">${g.comment || 'No comment'}</div>
                    <div class="test-meta">Added: ${g.createdAt ? g.createdAt.replace('T', ' ') : '-'}</div>
                </div>
            `).join('');
        }

        const avgEntries = Object.entries(avg);
        if (avgEntries.length) {
            averages.innerHTML = avgEntries.map(([subject, value]) => `
                <div class="metric-card">
                    <span class="metric-label">${subject}</span>
                    <strong class="metric-value">${Number(value).toFixed(2)}</strong>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Could not load grades:', error);
        list.innerHTML = '<p class="empty-state">Failed to load grades.</p>';
    }
}

async function loadStudentNotifications() {
    const container = document.getElementById('studentNotifications');
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

window.loadStudentGrades = loadStudentGrades;

setupTestCanvasEvents();
window.addEventListener('resize', () => {
    if (activeTestSession) resizeTestCanvas();
});
window.addEventListener('beforeunload', testGuardBeforeUnload);
window.addEventListener('keydown', testGuardKeydown, true);
document.addEventListener('fullscreenchange', () => {
    if (!testGuardEnabled) return;
    const guard = document.getElementById('testGuardStatus');
    if (!document.fullscreenElement) {
        if (guard) guard.textContent = 'Fullscreen lock: restoring...';
        requestWorkspaceFullscreen().finally(() => {
            if (guard) guard.textContent = document.fullscreenElement ? 'Fullscreen lock: on' : 'Fullscreen lock: limited by browser';
        });
        return;
    }
    if (guard) guard.textContent = 'Fullscreen lock: on';
});
