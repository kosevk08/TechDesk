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

function initLogoParticles() {
    const canvas = document.getElementById('logoParticlesCanvas');
    const logo = document.querySelector('.hero-logo');
    const stage = document.querySelector('.logo-stage');
    if (!canvas || !logo || !stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const pointer = { x: 0, y: 0, active: false };
    let particles = [];
    let rafId = null;

    function resize() {
        const size = 320;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function sampleLogoTargets() {
        const off = document.createElement('canvas');
        off.width = 220;
        off.height = 220;
        const octx = off.getContext('2d');
        octx.clearRect(0, 0, off.width, off.height);
        octx.drawImage(logo, 0, 0, off.width, off.height);
        const data = octx.getImageData(0, 0, off.width, off.height).data;
        const targets = [];
        const step = 7;
        for (let y = 0; y < off.height; y += step) {
            for (let x = 0; x < off.width; x += step) {
                const idx = (y * off.width + x) * 4;
                const alpha = data[idx + 3];
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
                const insideSafeArea = x > 18 && x < off.width - 18 && y > 18 && y < off.height - 18;
                // Keep only visible/light logo strokes, skip dark background.
                if (alpha > 110 && luminance > 95 && insideSafeArea) {
                    targets.push({
                        x: x + 50,
                        y: y + 50
                    });
                }
            }
        }
        return targets;
    }

    function setupParticles() {
        const sampled = sampleLogoTargets();
        // Keep it noticeable but not distracting.
        const targets = sampled.filter((_, i) => i % 2 === 0);
        particles = targets.map((t) => ({
            x: 160 + (Math.random() - 0.5) * 200,
            y: 160 + (Math.random() - 0.5) * 200,
            tx: t.x,
            ty: t.y,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.2 + 1.4
        }));
    }

    function animate() {
        ctx.clearRect(0, 0, 320, 320);
        for (const p of particles) {
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            p.vx += dx * 0.015;
            p.vy += dy * 0.015;
            if (pointer.active) {
                const rx = p.x - pointer.x;
                const ry = p.y - pointer.y;
                const dist = Math.hypot(rx, ry) || 1;
                if (dist < 62) {
                    p.vx += (rx / dist) * 0.9;
                    p.vy += (ry / dist) * 0.9;
                }
            }
            p.vx *= 0.84;
            p.vy *= 0.84;
            p.x += p.vx;
            p.y += p.vy;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.2);
            grad.addColorStop(0, 'rgba(186, 230, 253, 0.92)');
            grad.addColorStop(0.55, 'rgba(96, 165, 250, 0.42)');
            grad.addColorStop(1, 'rgba(48, 170, 186, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3.2, 0, Math.PI * 2);
            ctx.fill();
        }
        rafId = requestAnimationFrame(animate);
    }

    stage.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
    });
    stage.addEventListener('mouseleave', () => {
        pointer.active = false;
    });

    resize();
    setupParticles();
    animate();
    window.addEventListener('resize', () => {
        resize();
        setupParticles();
    });
    window.addEventListener('beforeunload', () => {
        if (rafId) cancelAnimationFrame(rafId);
    });
}

window.addEventListener('load', initLogoParticles);
