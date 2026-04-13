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

            if (user.role === 'TEACHER') {
                window.location.href = '/teacher';
            } else if (user.role === 'STUDENT') {
                window.location.href = '/student';
            } else if (user.role === 'PARENT') {
                window.location.href = '/parent';
            } else if (user.role === 'ADMIN') {
                window.location.href = '/admin';
            }
        } else {
            errorMsg.textContent = 'Invalid email or password!';
        }
    } catch (error) {
        errorMsg.innerHTML = `
            Offline Mode: Cannot reach server.<br>
            <a href="#" onclick="openDemoModal()" style="color:var(--accent)">Use Offline Demo Mode instead?</a>
        `;
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
    window.location.href = profile.route;
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

/**
 * Neural Network Background Animation
 */
function initLoginAnimation() {
    const canvas = document.createElement('canvas');
    canvas.id = 'login-bg-canvas';
    document.body.prepend(canvas);

    const style = document.createElement('style');
    style.textContent = `
        #login-bg-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
        }
        .login-card, #loginForm, .demo-modal-content {
            background: rgba(15, 23, 42, 0.7) !important;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
    `;
    document.head.appendChild(style);

    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 100;
    const mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    class Particle {
        constructor(x, y, dx, dy, size) {
            this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
            if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
            this.x += this.dx;
            this.y += this.dy;
            this.draw();
        }
    }

    function init() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            let size = Math.random() * 2 + 1;
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let dx = (Math.random() - 0.5) * 0.8;
            let dy = (Math.random() - 0.5) * 0.8;
            particles.push(new Particle(x, y, dx, dy, size));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            for (let j = i; j < particles.length; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (dist < 150) {
                    const opacity = 1 - (dist / 150);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    init();
    animate();
}
initLoginAnimation();