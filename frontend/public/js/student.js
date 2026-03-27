const user = JSON.parse(localStorage.getItem('user'));
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';

if (!user || user.role !== 'STUDENT') {
    window.location.href = '/';
}

const egnToName = {
    '1000000001': 'Victor',
    '1000000002': 'Konstantin',
    '1000000003': 'Ivan',
    '1000000004': 'John',
    '1000000005': 'Daniel',
    '1000000006': 'Sofia',
    '1000000007': 'Marcus',
    '1000000008': 'Elena',
    '1000000009': 'Liam',
    '1000000010': 'Victor',
    '1000000011': 'Natalie',
    '1000000012': 'Carlos'
};

document.getElementById('studentName').textContent = egnToName[user.egn] || user.email.split('@')[0];
document.getElementById('studentClass').textContent = '11D';

async function loadSubjects() {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/subject/all`);
        const subjects = await response.json();
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
    } catch (error) {
        console.error('Could not load subjects:', error);
    }
}

const AI_TRACKER_URL = `${BACKEND_BASE_URL}/ai/task-data`;

function sendAiTaskData(taskData) {
    const payload = JSON.stringify(taskData);

    try {
        if (navigator.sendBeacon) {
            const queued = navigator.sendBeacon(
                AI_TRACKER_URL,
                new Blob([payload], { type: 'application/json' })
            );

            if (queued) {
                console.log('AI task tracking queued successfully');
                return;
            }

            console.warn('AI task tracking beacon could not be queued, falling back to fetch');
        }

        fetch(AI_TRACKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        studentId: user.egn,
        completed: true,
        skipped: false,
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

loadSubjects();
