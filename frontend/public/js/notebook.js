const user = JSON.parse(localStorage.getItem('user'));
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';

function authHeaders(extra = {}) {
    const headers = { ...extra };
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.egn) headers['X-User-Egn'] = user.egn;
    return headers;
}
if (!user || user.role !== 'STUDENT') {
    window.location.href = '/';
}

const subjectId = localStorage.getItem('currentSubject');
let currentColor = 'blue';
let notebookId = null;

const mathsSubjectNames = ['maths', 'mathematics'];

async function loadNotebook() {
    try {
        const subjectRes = await fetch(`${BACKEND_BASE_URL}/api/subject/${subjectId}`, {
            headers: authHeaders()
        });
        const subject = await subjectRes.json();
        document.getElementById('subjectTitle').textContent = subject.name;

        const isMaths = mathsSubjectNames.includes(subject.name.toLowerCase());
        const notebook = document.getElementById('notebook');
        notebook.classList.add(isMaths ? 'squared' : 'lined');

        const notebookRes = await fetch(`${BACKEND_BASE_URL}/api/notebook/me`, {
            headers: authHeaders()
        });
        const notebooks = await notebookRes.json();
        const found = notebooks.find(n => n.subject === subject.name);

        if (found) {
            notebookId = found.id;
            document.getElementById('notebookText').value = found.content;
            setColor(found.color || 'blue');
        }
    } catch (error) {
        console.error('Could not load notebook:', error);
    }
}

function setColor(color) {
    currentColor = color;
    document.getElementById('notebookText').style.color = color === 'blue' ? '#1a56db' : '#111111';
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.color-btn.${color}`).classList.add('active');
}

async function saveNotebook() {
    const content = document.getElementById('notebookText').value;
    const subjectRes = await fetch(`${BACKEND_BASE_URL}/api/subject/${subjectId}`, {
        headers: authHeaders()
    });
    const subject = await subjectRes.json();

    const body = {
        subject: subject.name,
        schoolYear: '2025-2026',
        format: 'A4',
        style: 'lined',
        color: currentColor,
        content: content
    };

    const url = `${BACKEND_BASE_URL}/api/notebook/save/me`;
    const method = 'POST';

    await fetch(url, {
        method: method,
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
    });

    alert('Notebook saved!');
}

loadNotebook();
