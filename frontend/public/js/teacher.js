const socket = io('https://techdesk-frontend.onrender.com');
const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'TEACHER') {
    window.location.href = '/';
}

const teacherNames = {
    'h.schmidt-teacher@edu-school.bg': 'Miss Schmidt',
    'a.popescu-teacher@edu-school.bg': 'Mr Popescu',
    'e.vasileva-teacher@edu-school.bg': 'Mrs Vasileva'
};

document.getElementById('teacherName').textContent = teacherNames[user.email] || user.email;

const egnToName = {
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
    '9000000001': 'Radoslav Paskalev'
};

let currentViewEgn = null;
let currentViewSubject = null;
let currentViewPage = 1;
const teacherCanvas = document.getElementById('teacherCanvas');
const tCtx = teacherCanvas.getContext('2d');

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
        const res = await fetch(`https://techdesk-backend.onrender.com/api/notebook/student/${currentViewEgn}/${encodeURIComponent(currentViewSubject)}/${currentViewPage}?t=${Date.now()}`);
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
        const response = await fetch(`https://techdesk-backend.onrender.com/api/notebook/all?t=${Date.now()}`);
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