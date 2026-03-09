const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'STUDENT') {
    window.location.href = '/';
}

const egnToName = {
    '1000000001': 'Viktor',
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
        const response = await fetch('http://localhost:8080/api/subject/all');
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

function openSubject(subjectId) {
    localStorage.setItem('currentSubject', subjectId);
    window.location.href = '/notebook';
}

loadSubjects();