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
let practiceQuestions = [];
let practiceIndex = 0;
let practiceScore = 0;
let practiceAnswered = false;
let currentPracticeGame = 'flash';
let studentLang = localStorage.getItem('studentLang') || 'en';
let currentClassroomLock = false;
let currentStudentDisplayName = 'Student';
let currentStudentClassName = '-';
const supportedStudentLangs = ['en', 'bg', 'it', 'de', 'el', 'ro', 'sr'];
const I18N = {
    en: {
        hello: 'Hello',
        studentWorkspace: 'Student Workspace',
        classLabel: 'Class:',
        heroDesc: 'Track your lessons, write live notes, and stay connected with your teacher.',
        liveStudyTools: 'Live study tools',
        attendance: 'Attendance',
        home: 'Home',
        subjects: 'Subjects',
        schedule: 'Schedule',
        homework: 'Homework',
        practice: 'Practice',
        grades: 'Grades',
        tests: 'Tests',
        notifications: 'Notifications',
        directory: 'Directory',
        users: 'Users',
        refresh: 'Refresh',
        logout: 'Logout',
        loading: 'Loading...',
        noDataSchedule: 'No schedule data yet.',
        noDataHomework: 'No homework data yet.',
        noNotifications: 'No notifications yet.',
        openSubjects: 'Open Subjects',
        openSchedule: 'Open Schedule',
        openHomework: 'Open Homework',
        startPractice: 'Start Practice',
        viewAttendance: 'View Attendance',
        openMessages: 'Open Messages',
        openTests: 'Open Tests',
        rewards: 'Rewards',
        motivation: 'Motivation',
        next: 'Next',
        newRound: 'New Round',
        testsSoon: 'Tests Soon',
        homeworkTomorrow: 'Homework Tomorrow',
        studyLoad: 'Study Load',
        priority: 'Priority',
        noRecordsYet: 'No records yet.',
        classroomFocusMode: 'Classroom Focus Mode',
        teacherPresenting: 'Teacher is presenting. Stay on this screen.'
    },
    bg: {
        hello: 'Здравей',
        studentWorkspace: 'Ученически профил',
        classLabel: 'Клас:',
        heroDesc: 'Следи уроците си, пиши бележки на живо и бъди свързан с учителя.',
        liveStudyTools: 'Инструменти за учене',
        attendance: 'Присъствие',
        home: 'Начало',
        subjects: 'Предмети',
        schedule: 'Програма',
        homework: 'Домашни',
        practice: 'Практика',
        grades: 'Оценки',
        tests: 'Тестове',
        notifications: 'Известия',
        directory: 'Директория',
        users: 'Потребители',
        refresh: 'Обнови',
        logout: 'Изход',
        loading: 'Зареждане...',
        noDataSchedule: 'Все още няма програма.',
        noDataHomework: 'Все още няма домашни.',
        noNotifications: 'Все още няма известия.',
        openSubjects: 'Отвори предмети',
        openSchedule: 'Отвори програма',
        openHomework: 'Отвори домашни',
        startPractice: 'Старт практика',
        viewAttendance: 'Виж присъствие',
        openMessages: 'Отвори съобщения',
        openTests: 'Отвори тестове',
        rewards: 'Награди',
        motivation: 'Мотивация',
        next: 'Напред',
        newRound: 'Нов рунд',
        testsSoon: 'Скорошни тестове',
        homeworkTomorrow: 'Домашно за утре',
        studyLoad: 'Натоварване',
        priority: 'Приоритет',
        noRecordsYet: 'Все още няма записи.',
        classroomFocusMode: 'Режим фокус',
        teacherPresenting: 'Учителят представя. Остани на този екран.'
    },
    it: { hello: 'Ciao', studentWorkspace: 'Area Studente', classLabel: 'Classe:', heroDesc: 'Segui le lezioni, scrivi appunti in tempo reale e resta connesso con il docente.', liveStudyTools: 'Strumenti studio live', attendance: 'Presenze', home: 'Home', subjects: 'Materie', schedule: 'Orario', homework: 'Compiti', practice: 'Esercizi', grades: 'Voti', tests: 'Test', notifications: 'Notifiche', logout: 'Esci', loading: 'Caricamento...', noDataSchedule: 'Nessun orario disponibile.', noDataHomework: 'Nessun compito disponibile.', noNotifications: 'Nessuna notifica.', openSubjects: 'Apri Materie', openSchedule: 'Apri Orario', openHomework: 'Apri Compiti', startPractice: 'Inizia Esercizi', viewAttendance: 'Vedi Presenze', openMessages: 'Apri Messaggi', openTests: 'Apri Test', rewards: 'Ricompense', motivation: 'Motivazione', next: 'Avanti', newRound: 'Nuovo turno', testsSoon: 'Test in arrivo', homeworkTomorrow: 'Compiti per domani', studyLoad: 'Carico studio', priority: 'Priorità', noRecordsYet: 'Nessun record.', classroomFocusMode: 'Modalità Focus Classe', teacherPresenting: 'Il docente sta presentando. Resta su questa schermata.' },
    de: { hello: 'Hallo', studentWorkspace: 'Schülerbereich', classLabel: 'Klasse:', heroDesc: 'Verfolge den Unterricht, schreibe Live-Notizen und bleibe mit der Lehrkraft verbunden.', liveStudyTools: 'Live-Lernwerkzeuge', attendance: 'Anwesenheit', home: 'Start', subjects: 'Fächer', schedule: 'Stundenplan', homework: 'Hausaufgaben', practice: 'Übung', grades: 'Noten', tests: 'Tests', notifications: 'Benachrichtigungen', logout: 'Abmelden', loading: 'Lädt...', noDataSchedule: 'Noch keine Stundenplandaten.', noDataHomework: 'Noch keine Hausaufgaben.', noNotifications: 'Noch keine Benachrichtigungen.', openSubjects: 'Fächer öffnen', openSchedule: 'Stundenplan öffnen', openHomework: 'Hausaufgaben öffnen', startPractice: 'Übung starten', viewAttendance: 'Anwesenheit ansehen', openMessages: 'Nachrichten öffnen', openTests: 'Tests öffnen', rewards: 'Belohnungen', motivation: 'Motivation', next: 'Weiter', newRound: 'Neue Runde', testsSoon: 'Tests bald', homeworkTomorrow: 'Hausaufgaben morgen', studyLoad: 'Lernaufwand', priority: 'Priorität', noRecordsYet: 'Noch keine Einträge.', classroomFocusMode: 'Klassen-Fokusmodus', teacherPresenting: 'Die Lehrkraft präsentiert. Bitte auf diesem Bildschirm bleiben.' },
    el: { hello: 'Γεια σου', studentWorkspace: 'Χώρος Μαθητή', classLabel: 'Τάξη:', heroDesc: 'Παρακολούθησε τα μαθήματά σου, γράψε σημειώσεις ζωντανά και μείνε συνδεδεμένος με τον καθηγητή.', liveStudyTools: 'Εργαλεία μελέτης', attendance: 'Παρουσίες', home: 'Αρχική', subjects: 'Μαθήματα', schedule: 'Πρόγραμμα', homework: 'Εργασίες', practice: 'Εξάσκηση', grades: 'Βαθμοί', tests: 'Τεστ', notifications: 'Ειδοποιήσεις', logout: 'Έξοδος', loading: 'Φόρτωση...', noDataSchedule: 'Δεν υπάρχουν στοιχεία προγράμματος.', noDataHomework: 'Δεν υπάρχουν εργασίες.', noNotifications: 'Δεν υπάρχουν ειδοποιήσεις.', openSubjects: 'Άνοιγμα μαθημάτων', openSchedule: 'Άνοιγμα προγράμματος', openHomework: 'Άνοιγμα εργασιών', startPractice: 'Έναρξη εξάσκησης', viewAttendance: 'Προβολή παρουσιών', openMessages: 'Άνοιγμα μηνυμάτων', openTests: 'Άνοιγμα τεστ', rewards: 'Ανταμοιβές', motivation: 'Κίνητρο', next: 'Επόμενο', newRound: 'Νέος γύρος', testsSoon: 'Τεστ σύντομα', homeworkTomorrow: 'Εργασίες για αύριο', studyLoad: 'Φορτίο μελέτης', priority: 'Προτεραιότητα', noRecordsYet: 'Δεν υπάρχουν εγγραφές.', classroomFocusMode: 'Λειτουργία Συγκέντρωσης', teacherPresenting: 'Ο καθηγητής παρουσιάζει. Μείνε σε αυτή την οθόνη.' },
    ro: { hello: 'Salut', studentWorkspace: 'Spațiu Elev', classLabel: 'Clasa:', heroDesc: 'Urmărește lecțiile, scrie notițe live și rămâi conectat cu profesorul.', liveStudyTools: 'Instrumente de studiu live', attendance: 'Prezență', home: 'Acasă', subjects: 'Materii', schedule: 'Orar', homework: 'Teme', practice: 'Exercițiu', grades: 'Note', tests: 'Teste', notifications: 'Notificări', logout: 'Ieșire', loading: 'Se încarcă...', noDataSchedule: 'Nu există date de orar.', noDataHomework: 'Nu există teme.', noNotifications: 'Nu există notificări.', openSubjects: 'Deschide Materii', openSchedule: 'Deschide Orar', openHomework: 'Deschide Teme', startPractice: 'Începe Exercițiul', viewAttendance: 'Vezi Prezența', openMessages: 'Deschide Mesaje', openTests: 'Deschide Teste', rewards: 'Recompense', motivation: 'Motivație', next: 'Următorul', newRound: 'Rundă nouă', testsSoon: 'Teste curând', homeworkTomorrow: 'Teme pentru mâine', studyLoad: 'Volum de studiu', priority: 'Prioritate', noRecordsYet: 'Nu există înregistrări.', classroomFocusMode: 'Mod Focus Clasă', teacherPresenting: 'Profesorul prezintă. Rămâi pe acest ecran.' },
    sr: { hello: 'Здраво', studentWorkspace: 'Учeнички профил', classLabel: 'Разред:', heroDesc: 'Прати часове, пиши белешке уживо и остани повезан са наставником.', liveStudyTools: 'Алати за учење', attendance: 'Присуство', home: 'Почетна', subjects: 'Предмети', schedule: 'Распоред', homework: 'Домаћи', practice: 'Вежба', grades: 'Оцене', tests: 'Тестови', notifications: 'Обавештења', logout: 'Одјава', loading: 'Учитавање...', noDataSchedule: 'Још нема распореда.', noDataHomework: 'Још нема домаћих.', noNotifications: 'Нема обавештења.', openSubjects: 'Отвори предмете', openSchedule: 'Отвори распоред', openHomework: 'Отвори домаће', startPractice: 'Покрени вежбу', viewAttendance: 'Погледај присуство', openMessages: 'Отвори поруке', openTests: 'Отвори тестове', rewards: 'Награде', motivation: 'Мотивација', next: 'Даље', newRound: 'Нова рунда', testsSoon: 'Тестови ускоро', homeworkTomorrow: 'Домаћи за сутра', studyLoad: 'Оптерећење', priority: 'Приоритет', noRecordsYet: 'Још нема записа.', classroomFocusMode: 'Режим фокуса', teacherPresenting: 'Наставник презентује. Остани на овом екрану.' }
};

function deriveNameFromEmail(email) {
    if (!email) return 'Student';
    const local = String(email).split('@')[0] || '';
    const first = local.split(/[-._]/)[0] || 'Student';
    return first.charAt(0).toUpperCase() + first.slice(1);
}

function getCurrentStudentName() {
    return currentStudentDisplayName || user?.displayName || deriveNameFromEmail(user?.email) || 'Student';
}
const rewardsStorageKey = `techdesk_rewards_${user?.email || user?.egn || 'student'}`;
let rewardsState = {
    xp: 0,
    streak: 1,
    testsSubmitted: 0,
    practiceRounds: 0,
    badges: []
};
const testCanvas = document.getElementById('testAnswerCanvas');
const testCtx = testCanvas ? testCanvas.getContext('2d') : null;

function authHeaders(extra = {}) {
    const headers = token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.egn) headers['X-User-Egn'] = user.egn;
    return headers;
}

function loadRewardsState() {
    try {
        const raw = localStorage.getItem(rewardsStorageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        rewardsState = { ...rewardsState, ...parsed, badges: Array.isArray(parsed.badges) ? parsed.badges : [] };
    } catch {
        // Keep defaults if parsing fails.
    }
}

function saveRewardsState() {
    localStorage.setItem(rewardsStorageKey, JSON.stringify(rewardsState));
}

function t(key) {
    const lang = supportedStudentLangs.includes(studentLang) ? studentLang : 'en';
    return I18N[lang]?.[key] || I18N.en[key] || key;
}

function addReward(xp, badge, reason) {
    rewardsState.xp += Math.max(0, Number(xp || 0));
    if (badge && !rewardsState.badges.includes(badge)) rewardsState.badges.push(badge);
    if (reason) botMessage(`Reward unlocked: ${reason}`, false);
    saveRewardsState();
    renderRewards();
}

function renderRewards() {
    const grid = document.getElementById('rewardsGrid');
    const badges = document.getElementById('practiceBadges');
    if (grid) {
        grid.innerHTML = `
            <div class="reward-tile"><span>XP</span><strong>${rewardsState.xp}</strong></div>
            <div class="reward-tile"><span>${t('studyLoad')}</span><strong>${rewardsState.streak}</strong></div>
            <div class="reward-tile"><span>${t('practice')}</span><strong>${rewardsState.practiceRounds}</strong></div>
            <div class="reward-tile"><span>${t('tests')}</span><strong>${rewardsState.testsSubmitted}</strong></div>
        `;
    }
    if (badges) {
        badges.innerHTML = rewardsState.badges.length
            ? rewardsState.badges.map((badge) => `<span class="practice-badge">${badge}</span>`).join('')
            : `<span class="practice-badge muted">${t('noNotifications')}</span>`;
    }
}

function updateLanguageTexts() {
    const select = document.getElementById('languageSelect');
    if (select && select.value !== studentLang) select.value = studentLang;

    const logout = document.querySelector('.navbar .logout[href="/"]');
    if (logout) logout.textContent = t('logout');
    const eyebrow = document.querySelector('.greeting .section-eyebrow');
    if (eyebrow) eyebrow.textContent = t('studentWorkspace');
    const classP = document.querySelector('.greeting p');
    if (classP) classP.firstChild.textContent = `${t('classLabel')} `;
    const h2 = document.querySelector('.greeting h2');
    if (h2 && h2.firstChild) h2.firstChild.nodeValue = `${t('hello')}, `;
    const greetDesc = document.querySelector('.greeting p:last-child');
    if (greetDesc) greetDesc.textContent = t('heroDesc');
    const heroPill = document.querySelector('.hero-pill');
    if (heroPill) heroPill.textContent = t('liveStudyTools');
    const attendanceLbl = document.querySelector('.hero-stat-label');
    if (attendanceLbl) attendanceLbl.textContent = t('attendance');
    const tabs = {
        home: 'home', subjects: 'subjects', schedule: 'schedule', homework: 'homework',
        practice: 'practice', attendance: 'attendance', grades: 'grades', tests: 'tests', notifications: 'notifications'
    };
    Object.entries(tabs).forEach(([panel, key]) => {
        const btn = document.querySelector(`.student-tab[data-panel-btn="${panel}"]`);
        if (btn) btn.textContent = t(key);
    });
    const cards = document.querySelectorAll('.dashboard-grid .card');
    if (cards[0]) cards[0].querySelector('h3').textContent = t('subjects');
    if (cards[0]) cards[0].querySelector('button').textContent = t('openSubjects');
    if (cards[1]) cards[1].querySelector('h3').textContent = t('schedule');
    if (cards[1]) cards[1].querySelector('button').textContent = t('openSchedule');
    if (cards[2]) cards[2].querySelector('h3').textContent = t('homework');
    if (cards[2]) cards[2].querySelector('button').textContent = t('openHomework');
    if (cards[3]) cards[3].querySelector('h3').textContent = t('practice');
    if (cards[3]) cards[3].querySelector('button').textContent = t('startPractice');
    if (cards[4]) cards[4].querySelector('h3').textContent = t('attendance');
    if (cards[4]) cards[4].querySelector('button').textContent = t('viewAttendance');
    if (cards[5]) cards[5].querySelector('button').textContent = t('openMessages');
    if (cards[6]) cards[6].querySelector('h3').textContent = t('tests');
    if (cards[6]) cards[6].querySelector('button').textContent = t('openTests');
    const lockTitle = document.querySelector('#classroomLockOverlay h3');
    if (lockTitle) lockTitle.textContent = t('classroomFocusMode');
    const lockMsg = document.getElementById('classroomLockMessage');
    if (lockMsg && !currentClassroomLock) lockMsg.textContent = t('teacherPresenting');
    const nextBtn = document.getElementById('practiceNextBtn');
    if (nextBtn) nextBtn.textContent = t('next');
    const newRoundBtn = document.querySelector('#practiceSection .section-header .action-btn');
    if (newRoundBtn) newRoundBtn.textContent = t('newRound');
    const testsSoon = document.querySelector('#focusBoard .focus-item:nth-child(1) .focus-label');
    if (testsSoon) testsSoon.textContent = t('testsSoon');
    const hwTomorrow = document.querySelector('#focusBoard .focus-item:nth-child(2) .focus-label');
    if (hwTomorrow) hwTomorrow.textContent = t('homeworkTomorrow');
    const studyLoad = document.querySelector('#focusBoard .focus-item:nth-child(3) .focus-label');
    if (studyLoad) studyLoad.textContent = t('studyLoad');
    const priority = document.querySelector('#focusBoard .focus-item:nth-child(4) .focus-label');
    if (priority) priority.textContent = t('priority');
    const sectionTitles = {
        '#subjectsSection .section-title': 'subjects',
        '#scheduleSection .section-title': 'schedule',
        '#homeworkSection .section-title': 'homework',
        '#attendanceSection .section-title': 'attendance',
        '#gradesSection .section-title': 'grades',
        '#testsSection .section-title': 'tests'
    };
    Object.entries(sectionTitles).forEach(([sel, key]) => {
        const el = document.querySelector(sel);
        if (el) el.textContent = t(key);
    });
    const rewardsTitle = document.querySelector('.rewards-board .section-title');
    if (rewardsTitle) rewardsTitle.textContent = t('rewards');
    const rewardsEye = document.querySelector('.rewards-board .section-eyebrow');
    if (rewardsEye) rewardsEye.textContent = t('motivation');
    const notificationsTitle = document.querySelector('[data-panel="notifications"] h4');
    if (notificationsTitle) notificationsTitle.textContent = t('notifications');
    const botGreeting = document.querySelector('#studyBotBody .study-bot-msg');
    if (botGreeting) botGreeting.textContent = `Hi, I am ThroneBuddy.`;
    const botInput = document.getElementById('studyBotInput');
    if (botInput) botInput.placeholder = '...';
    const botAskBtn = document.querySelector('.study-bot-input-row button');
    if (botAskBtn) botAskBtn.textContent = studentLang === 'bg' ? 'Питай' : 'Ask';
    const testKicker = document.querySelector('.test-kicker');
    if (testKicker) testKicker.textContent = studentLang === 'bg' ? 'Режим Тест' : 'Exam Mode';
    const penBtn = document.getElementById('testPenBtn');
    if (penBtn) penBtn.textContent = studentLang === 'bg' ? 'Химикал' : 'Pen';
    const clearBtn = document.querySelector('.test-tools .tool-btn:not(.active)');
    if (clearBtn) clearBtn.textContent = studentLang === 'bg' ? 'Изчисти' : 'Clear';
    const submitBtn = document.querySelector('.test-tools .action-btn');
    if (submitBtn) submitBtn.textContent = studentLang === 'bg' ? 'Предай тест' : 'Submit Test';
    const dirSection = document.getElementById('studentDirectoryList')?.closest('.section-card');
    if (dirSection) {
        const e = dirSection.querySelector('.section-eyebrow');
        const st = dirSection.querySelector('.section-title');
        const b = dirSection.querySelector('button');
        if (e) e.textContent = t('directory');
        if (st) st.textContent = t('users');
        if (b) b.textContent = t('refresh');
    }
}

function setStudentLanguage(lang) {
    studentLang = supportedStudentLangs.includes(lang) ? lang : 'en';
    localStorage.setItem('studentLang', studentLang);
    updateLanguageTexts();
    renderRewards();
}

function setClassroomLock(enabled, message = '') {
    currentClassroomLock = Boolean(enabled);
    const overlay = document.getElementById('classroomLockOverlay');
    const msg = document.getElementById('classroomLockMessage');
    if (msg) msg.textContent = message || t('teacherPresenting');
    if (overlay) overlay.style.display = currentClassroomLock ? 'flex' : 'none';
}

function emitStudentPresence(state = 'active') {
    if (isDemo) return;
    socket.emit('student-presence', {
        studentName: getCurrentStudentName(),
        studentEgn: user?.egn || null,
        className: currentStudentClassName || user?.className || null,
        state,
        updatedAt: Date.now()
    });
}

if (!user || user.role !== 'STUDENT') {
    window.location.href = '/';
}

if (isDemo && demoData) {
    currentStudentDisplayName = demoData.student.name || 'Student';
    currentStudentClassName = demoData.student.className || '-';
    document.getElementById('studentName').textContent = currentStudentDisplayName;
    document.getElementById('studentClass').textContent = currentStudentClassName;
} else {
    currentStudentDisplayName = user.displayName || deriveNameFromEmail(user.email) || 'Student';
    currentStudentClassName = user.className || '-';
    document.getElementById('studentName').textContent = currentStudentDisplayName;
    document.getElementById('studentClass').textContent = currentStudentClassName;
}

async function loadStudentIdentity() {
    if (isDemo) return;
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/student/me?t=${Date.now()}`, {
            headers: authHeaders()
        });
        if (!res.ok) return;
        const profile = await res.json();
        if (!profile) return;
        const firstName = String(profile.firstName || '').trim();
        const fallbackName = String((profile.firstName || '') + ' ' + (profile.lastName || '')).trim();
        currentStudentDisplayName = firstName || fallbackName || currentStudentDisplayName;
        currentStudentClassName = profile.className || currentStudentClassName;
        const nameEl = document.getElementById('studentName');
        const classEl = document.getElementById('studentClass');
        if (nameEl) nameEl.textContent = currentStudentDisplayName;
        if (classEl) classEl.textContent = currentStudentClassName;
        updateLanguageTexts();
    } catch (error) {
        console.error('Could not load student identity:', error);
    }
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
        studentId: getCurrentStudentName(),
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
        return;
    }

    if (panelName === 'practice' && !practiceQuestions.length) {
        startPracticeGame();
    }
}

function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildFlashQuestions() {
    const pool = [];
    const bySubject = {};

    (studentTestsCache || []).forEach(test => {
        const subject = test.subject || 'General';
        bySubject[subject] = (bySubject[subject] || 0) + 1;
    });
    (studentHomeworkCache || []).forEach(hw => {
        const subject = hw.subject || 'General';
        bySubject[subject] = (bySubject[subject] || 0) + 1;
    });

    Object.entries(bySubject).forEach(([subject, count]) => {
        pool.push({
            text: `Which subject currently needs the most attention?`,
            correct: subject,
            choices: shuffle([subject, 'English', 'Maths', 'Physics'].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4)
        });
        pool.push({
            text: `How many active tasks are currently linked to ${subject}?`,
            correct: String(count),
            choices: shuffle([String(count), String(Math.max(0, count - 1)), String(count + 1), String(count + 2)]).slice(0, 4)
        });
    });

    (studentTestsCache || []).slice(0, 5).forEach(test => {
        const status = test.status || 'ASSIGNED';
        pool.push({
            text: `What is the current status of "${test.title}"?`,
            correct: status,
            choices: shuffle([status, 'GRADED', 'SUBMITTED', 'ASSIGNED']).slice(0, 4)
        });
    });

    if (!pool.length) {
        pool.push(
            {
                text: 'Quick check: which action helps most before a test?',
                correct: 'Review key mistakes',
                choices: shuffle(['Review key mistakes', 'Skip revision', 'Study random topics', 'Ignore due dates'])
            },
            {
                text: 'Best first step when homework is due tomorrow?',
                correct: 'Start with the hardest task first',
                choices: shuffle(['Start with the hardest task first', 'Wait until morning', 'Do nothing', 'Only read title'])
            },
            {
                text: 'What improves focus in short study sessions?',
                correct: 'Clear target + short timer',
                choices: shuffle(['Clear target + short timer', 'Multiple tabs open', 'No plan', 'Endless scrolling'])
            }
        );
    }

    return shuffle(pool).slice(0, 3);
}

function buildMistakeQuestions() {
    const pool = [
        {
            text: 'Which statement is the study mistake?',
            correct: 'Start revision the night before only',
            choices: shuffle([
                'Review with spaced sessions',
                'Start revision the night before only',
                'Check solved examples',
                'Track due dates in advance'
            ])
        },
        {
            text: 'Find the weak strategy before a test:',
            correct: 'Skip feedback and only read answers',
            choices: shuffle([
                'Solve and analyze mistakes',
                'Skip feedback and only read answers',
                'Do short timed sets',
                'Ask for help on unclear topics'
            ])
        },
        {
            text: 'Which one hurts long-term memory most?',
            correct: 'Passive rereading without recall',
            choices: shuffle([
                'Active recall with short notes',
                'Passive rereading without recall',
                'Mini quizzes',
                'Explaining concept aloud'
            ])
        }
    ];
    return pool;
}

function buildMatchQuestions() {
    const pool = [
        {
            text: 'Match: Area of rectangle = ?',
            correct: 'a × b',
            choices: shuffle(['a × b', '2(a+b)', 'a²+b²', 'a/b'])
        },
        {
            text: 'Match: Speed = ?',
            correct: 'distance / time',
            choices: shuffle(['distance / time', 'mass × acceleration', 'force / area', 'time / distance'])
        },
        {
            text: 'Match: Density = ?',
            correct: 'mass / volume',
            choices: shuffle(['mass / volume', 'volume / mass', 'force / mass', 'mass × volume'])
        }
    ];
    return pool;
}

function buildPracticeQuestions() {
    if (currentPracticeGame === 'mistake') return buildMistakeQuestions();
    if (currentPracticeGame === 'match') return buildMatchQuestions();
    return buildFlashQuestions();
}

function renderPracticeQuestion() {
    const progress = document.getElementById('practiceProgress');
    const score = document.getElementById('practiceScore');
    const qEl = document.getElementById('practiceQuestion');
    const choicesEl = document.getElementById('practiceChoices');
    const feedback = document.getElementById('practiceFeedback');
    const nextBtn = document.getElementById('practiceNextBtn');
    if (!qEl || !choicesEl || !feedback || !progress || !score || !nextBtn) return;

    const q = practiceQuestions[practiceIndex];
    if (!q) {
        qEl.textContent = `Round complete! Final score: ${practiceScore}/${practiceQuestions.length}`;
        choicesEl.innerHTML = '';
        feedback.textContent = 'Great job. Start a new round to keep practicing.';
        nextBtn.disabled = true;
        return;
    }

    progress.textContent = `Question ${practiceIndex + 1} / ${practiceQuestions.length}`;
    score.textContent = `Score: ${practiceScore}`;
    qEl.textContent = q.text;
    feedback.textContent = '';
    nextBtn.disabled = true;
    practiceAnswered = false;

    choicesEl.innerHTML = q.choices.map(choice => `
        <button type="button" class="practice-choice" data-choice="${choice.replaceAll('"', '&quot;')}">${choice}</button>
    `).join('');

    choicesEl.querySelectorAll('.practice-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            if (practiceAnswered) return;
            practiceAnswered = true;
            const isCorrect = btn.textContent === q.correct;
            if (isCorrect) practiceScore += 1;
            choicesEl.querySelectorAll('.practice-choice').forEach(option => {
                option.disabled = true;
                if (option.textContent === q.correct) option.classList.add('correct');
            });
            if (!isCorrect) btn.classList.add('wrong');
            score.textContent = `Score: ${practiceScore}`;
            feedback.textContent = isCorrect ? 'Correct. Nice focus.' : `Not quite. Correct answer: ${q.correct}`;
            nextBtn.disabled = false;
        });
    });
}

function startPracticeGame() {
    practiceQuestions = buildPracticeQuestions();
    practiceIndex = 0;
    practiceScore = 0;
    rewardsState.practiceRounds += 1;
    addReward(8, rewardsState.practiceRounds >= 3 ? 'Warmup Hero' : null, null);
    renderPracticeQuestion();
}

function setPracticeGame(game) {
    currentPracticeGame = ['flash', 'mistake', 'match'].includes(game) ? game : 'flash';
    document.querySelectorAll('.practice-game-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.game === currentPracticeGame);
    });
    startPracticeGame();
}

function nextPracticeQuestion() {
    if (practiceIndex < practiceQuestions.length - 1) {
        practiceIndex += 1;
        renderPracticeQuestion();
    } else {
        practiceIndex += 1;
        renderPracticeQuestion();
        const ratio = practiceQuestions.length ? (practiceScore / practiceQuestions.length) : 0;
        if (ratio >= 0.66) addReward(20, 'Quiz Sprinter', 'Strong practice result');
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

async function loadStudentDirectoryUsers() {
    const list = document.getElementById('studentDirectoryList');
    if (!list) return;
    try {
        if (isDemo && demoData) {
            const users = demoData.users || [];
            if (!users.length) {
                list.innerHTML = '<p class="empty-state">No users found.</p>';
                return;
            }
            list.innerHTML = users.map(u => `
                <div class="user-card-item">
                    <h4>${u.displayName || u.name || 'User'}</h4>
                    <div class="user-meta">${u.role || 'USER'} • ${u.email || '-'}</div>
                </div>
            `).join('');
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/user/directory`, { headers: authHeaders() });
        const users = res.ok ? await res.json() : [];
        if (!users.length) {
            list.innerHTML = '<p class="empty-state">No users found.</p>';
            return;
        }
        list.innerHTML = users.map(u => `
            <div class="user-card-item">
                <h4>${u.displayName || 'User'}</h4>
                <div class="user-meta">${u.role || 'USER'} • ${u.email || '-'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Could not load student directory users:', error);
        list.innerHTML = '<p class="empty-state">No users found.</p>';
    }
}

window.toggleStudyBot = toggleStudyBot;
window.askStudyBot = askStudyBot;
window.askStudyBotQuick = askStudyBotQuick;
window.quickOpenNotebook = quickOpenNotebook;
window.switchStudentPanel = switchStudentPanel;
window.startPracticeGame = startPracticeGame;
window.nextPracticeQuestion = nextPracticeQuestion;
window.setPracticeGame = setPracticeGame;
window.setStudentLanguage = setStudentLanguage;
window.loadStudentDirectoryUsers = loadStudentDirectoryUsers;

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
startPracticeGame();
switchStudentPanel('home');
loadRewardsState();
renderRewards();
updateLanguageTexts();
loadStudentIdentity();
emitStudentPresence('active');
loadStudentDirectoryUsers();

if (!isDemo) {
    socket.on('attendance-updated', (data) => {
        if (data?.studentName && data.studentName === getCurrentStudentName()) {
            loadAttendanceSummary();
        }
    });

    socket.on('test-assigned', () => {
        loadStudentTests();
    });

    socket.on('test-graded', (data) => {
        if (data?.studentName && data.studentName === getCurrentStudentName()) {
            loadStudentTests();
        }
    });

    socket.on('grade-updated', (data) => {
        if (data?.studentName && data.studentName === getCurrentStudentName()) {
            loadStudentGrades();
            loadStudentNotifications();
        }
    });

    socket.on('classroom-lock', (data) => {
        const targetClass = data?.className;
        const myClass = currentStudentClassName || user?.className || null;
        if (!targetClass || !myClass || targetClass === myClass) {
            setClassroomLock(true, data?.message || t('teacherPresenting'));
        }
    });

    socket.on('classroom-unlock', (data) => {
        const targetClass = data?.className;
        const myClass = currentStudentClassName || user?.className || null;
        if (!targetClass || !myClass || targetClass === myClass) {
            setClassroomLock(false);
        }
    });

    socket.on('classroom-sync-page', (data) => {
        const targetClass = data?.className;
        const myClass = currentStudentClassName || user?.className || null;
        if (targetClass && myClass && targetClass !== myClass) return;
        const panel = String(data?.panel || 'subjects');
        switchStudentPanel(panel);
        if (panel === 'subjects') {
            const section = document.getElementById('subjectsSection');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            rewardsState.testsSubmitted += 1;
            addReward(24, rewardsState.testsSubmitted >= 1 ? 'First Submission' : null, 'Test submitted');
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
        socket.emit('test-submitted', { testId, studentName: getCurrentStudentName() });
        rewardsState.testsSubmitted += 1;
        addReward(24, rewardsState.testsSubmitted >= 1 ? 'First Submission' : null, 'Test submitted');
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

window.addEventListener('visibilitychange', () => {
    emitStudentPresence(document.hidden ? 'inactive' : 'active');
});

window.addEventListener('focus', () => emitStudentPresence('active'));
window.addEventListener('blur', () => emitStudentPresence('inactive'));
setInterval(() => emitStudentPresence(document.hidden ? 'inactive' : 'active'), 20000);
