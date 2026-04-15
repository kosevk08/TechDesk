const loginSuccessOverlay = document.getElementById('loginSuccessOverlay');

function routeForRole(user) {
    if (user.role === 'TEACHER') return '/teacher';
    if (user.role === 'STUDENT') return '/student';
    if (user.role === 'PARENT') return '/parent';
    if (user.role === 'ADMIN') return '/admin';
    return '/';
}

function playLoginSuccessAndRedirect(route) {
    if (!loginSuccessOverlay) {
        window.location.href = route;
        return;
    }
    loginSuccessOverlay.classList.add('active');
    loginSuccessOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
        window.location.href = route;
    }, 1200);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            playLoginSuccessAndRedirect(routeForRole(user));
        } else {
            errorMsg.textContent = 'Invalid email or password!';
        }
    } catch (error) {
        errorMsg.textContent = 'Could not connect to server. Please try again.';
    }
});

const demoModal = document.getElementById('demoModal');
const openDemoBtn = document.getElementById('openDemo');
const closeDemoBtn = document.getElementById('closeDemo');
const cancelDemoBtn = document.getElementById('demoCancel');
const demoProfiles = document.getElementById('demoProfiles');
const demoData = window.DemoData;

function openDemoModal() {
    if (!demoModal) return;
    demoModal.classList.add('active');
    demoModal.setAttribute('aria-hidden', 'false');
}

function closeDemoModal() {
    if (!demoModal) return;
    demoModal.classList.remove('active');
    demoModal.setAttribute('aria-hidden', 'true');
}

function seedDemoProfile(profile) {
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
    playLoginSuccessAndRedirect(profile.route);
}

function buildDemoProfiles() {
    if (!demoProfiles) return;
    const profiles = [
        {
            title: 'Student',
            role: 'STUDENT',
            displayName: demoData?.student?.name || 'Demo Student',
            className: demoData?.student?.className || '11D',
            description: 'See subjects, tests, and live notebooks.',
            route: '/student'
        },
        {
            title: 'Teacher',
            role: 'TEACHER',
            displayName: demoData?.teacher?.name || 'Demo Teacher',
            description: 'Review notebooks, assign tests, and insights.',
            route: '/teacher'
        },
        {
            title: 'Parent',
            role: 'PARENT',
            displayName: demoData?.parent?.name || 'Demo Parent',
            childName: demoData?.parent?.studentName || demoData?.student?.name || 'Demo Student',
            childClassName: demoData?.student?.className || '11D',
            description: 'Monitor attendance, grades, and progress.',
            route: '/parent'
        },
        {
            title: 'Administrator',
            role: 'ADMIN',
            displayName: demoData?.admin?.name || 'Demo Admin',
            description: 'Review users, feedback, and system overview.',
            route: '/admin'
        }
    ];

    demoProfiles.innerHTML = profiles.map(profile => `
        <button type="button" class="demo-profile" data-role="${profile.role}">
            <h4>${profile.title}</h4>
            <p>${profile.description}</p>
        </button>
    `).join('');

    demoProfiles.querySelectorAll('.demo-profile').forEach((button, index) => {
        button.addEventListener('click', () => seedDemoProfile(profiles[index]));
    });
}

if (openDemoBtn) openDemoBtn.addEventListener('click', () => {
    buildDemoProfiles();
    openDemoModal();
});
if (closeDemoBtn) closeDemoBtn.addEventListener('click', closeDemoModal);
if (cancelDemoBtn) cancelDemoBtn.addEventListener('click', closeDemoModal);
if (demoModal) demoModal.addEventListener('click', (event) => {
    if (event.target === demoModal) closeDemoModal();
});

// Toggle password visibility
const toggleBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
        const showing = passwordInput.type === 'text';
        passwordInput.type = showing ? 'password' : 'text';
        toggleBtn.textContent = showing ? '👁' : '🙈';
        toggleBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
}
