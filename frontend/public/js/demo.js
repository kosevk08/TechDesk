const demoData = window.DemoData;
const demoGrid = document.getElementById('demoGrid');

function setDemoUser(profile) {
    const demoUser = {
        displayName: profile.displayName,
        role: profile.role,
        demo: true,
        className: profile.className || null,
        childName: profile.childName || null,
        childClassName: profile.childClassName || null
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-token');
    window.location.href = profile.route;
}

function resetDemo() {
    const keys = [
        'user',
        'token',
        'demo-feedback',
        'currentNotebookSubject',
        'currentNotebookPage',
        'currentClassName'
    ];
    keys.forEach(key => localStorage.removeItem(key));
    alert('Demo data reset.');
}

const profiles = [
    {
        title: 'Student',
        role: 'STUDENT',
        displayName: demoData?.student?.name || 'Demo Student',
        className: demoData?.student?.className || '11D',
        route: '/student',
        stats: [
            { label: 'Upcoming Tests', value: demoData?.tests?.length || 0 },
            { label: 'Subjects', value: demoData?.subjects?.length || 0 }
        ],
        highlights: [
            'Open live notebooks',
            'Submit tests in demo mode',
            'Track attendance and grades'
        ]
    },
    {
        title: 'Teacher',
        role: 'TEACHER',
        displayName: demoData?.teacher?.name || 'Demo Teacher',
        route: '/teacher',
        stats: [
            { label: 'Tests', value: demoData?.teacherTests?.length || 0 },
            { label: 'Notifications', value: demoData?.notifications?.length || 0 }
        ],
        highlights: [
            'Review student notebooks',
            'Assign tests + grades',
            'AI insights overview'
        ]
    },
    {
        title: 'Parent',
        role: 'PARENT',
        displayName: demoData?.parent?.name || 'Demo Parent',
        childName: demoData?.parent?.studentName || demoData?.student?.name,
        childClassName: demoData?.student?.className || '11D',
        route: '/parent',
        stats: [
            { label: 'Attendance Records', value: demoData?.attendance?.length || 0 },
            { label: 'Grades', value: demoData?.grades?.length || 0 }
        ],
        highlights: [
            'See child notebooks',
            'Review tests + grades',
            'Family attendance summary'
        ]
    },
    {
        title: 'Admin',
        role: 'ADMIN',
        displayName: demoData?.admin?.name || 'Demo Admin',
        route: '/admin',
        stats: [
            { label: 'Users', value: demoData?.users?.length || 0 },
            { label: 'Feedback', value: demoData?.feedback?.length || 0 }
        ],
        highlights: [
            'Monitor system health',
            'Review feedback',
            'Oversee accounts'
        ]
    }
];

function renderProfiles() {
    if (!demoGrid) return;
    demoGrid.innerHTML = profiles.map(profile => `
        <section class="demo-card">
            <span class="demo-chip">${profile.title}</span>
            <h3>${profile.displayName}</h3>
            <div class="demo-actions">
                <button type="button" data-role="${profile.role}">Open ${profile.title} View</button>
            </div>
            <div class="demo-list">
                ${profile.stats.map(stat => `
                    <div class="demo-metric">
                        <span>${stat.label}</span>
                        <strong>${stat.value}</strong>
                    </div>
                `).join('')}
            </div>
            <div class="demo-list">
                ${profile.highlights.map(item => `<div>• ${item}</div>`).join('')}
            </div>
        </section>
    `).join('');

    demoGrid.querySelectorAll('button[data-role]').forEach((button, index) => {
        button.addEventListener('click', () => setDemoUser(profiles[index]));
    });
}

renderProfiles();

const resetBtn = document.getElementById('resetDemo');
if (resetBtn) resetBtn.addEventListener('click', resetDemo);
