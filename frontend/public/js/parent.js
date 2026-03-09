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

async function loadNotebooks() {
    try {
        document.getElementById('attendanceSection').style.display = 'none';
        const response = await fetch(`http://localhost:8080/api/notebook/student/${user.studentEgn}?t=${Date.now()}`);
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
        const res = await fetch(`http://localhost:8080/api/notebook/student/${currentStudentEgn}/${encodeURIComponent(currentSubject)}/${currentPage}?t=${Date.now()}`);
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
    document.getElementById('notebooksSection').style.display = 'none';
    document.getElementById('notebookViewer').style.display = 'none';

    const section = document.getElementById('attendanceSection');
    const list = document.getElementById('attendanceList');
    section.style.display = 'block';
    list.innerHTML = '<p>Attendance records will appear here once the teacher marks them.</p>';
}