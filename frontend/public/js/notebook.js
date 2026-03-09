const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'STUDENT') {
    window.location.href = '/';
}

const subjectId = localStorage.getItem('currentSubject');
let currentColor = 'blue';
let notebookId = null;

const mathsSubjectNames = ['maths', 'mathematics'];

async function loadNotebook() {
    try {
        const subjectRes = await fetch(`http://localhost:8080/api/subject/${subjectId}`);
        const subject = await subjectRes.json();
        document.getElementById('subjectTitle').textContent = subject.name;

        const isMaths = mathsSubjectNames.includes(subject.name.toLowerCase());
        const notebook = document.getElementById('notebook');
        notebook.classList.add(isMaths ? 'squared' : 'lined');

        const notebookRes = await fetch(`http://localhost:8080/api/notebook/student/${user.egn}`);
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
    const subjectRes = await fetch(`http://localhost:8080/api/subject/${subjectId}`);
    const subject = await subjectRes.json();

    const body = {
        studentEgn: user.egn,
        subject: subject.name,
        schoolYear: '2025-2026',
        format: 'A4',
        style: 'lined',
        color: currentColor,
        content: content
    };

    const url = notebookId
        ? `http://localhost:8080/api/notebook/update/${notebookId}`
        : `http://localhost:8080/api/notebook/create`;

    const method = notebookId ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    alert('Notebook saved!');
}

loadNotebook();