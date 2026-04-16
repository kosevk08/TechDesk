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
    const canvas = document.getElementById('loginWallpaperCanvas');
    const logo = document.querySelector('.hero-logo');
    if (!canvas || !logo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const pointer = { x: 0, y: 0, active: false };
    let particles = [];
    let targets = [];
    let rafId = null;
    let cssW = window.innerWidth;
    let cssH = window.innerHeight;

    function resize() {
        cssW = window.innerWidth;
        cssH = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function sampleLogoShape() {
        const off = document.createElement('canvas');
        off.width = 180;
        off.height = 180;
        const octx = off.getContext('2d');
        octx.clearRect(0, 0, off.width, off.height);
        octx.drawImage(logo, 0, 0, off.width, off.height);
        const data = octx.getImageData(0, 0, off.width, off.height).data;
        const shapePoints = [];
        const step = 8;
        for (let y = 0; y < off.height; y += step) {
            for (let x = 0; x < off.width; x += step) {
                const idx = (y * off.width + x) * 4;
                const alpha = data[idx + 3];
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
                const insideSafeArea = x > 16 && x < off.width - 16 && y > 16 && y < off.height - 16;
                if (alpha > 110 && luminance > 95 && insideSafeArea) {
                    shapePoints.push({ x, y });
                }
            }
        }
        if (!shapePoints.length) return [];
        const minX = Math.min(...shapePoints.map((p) => p.x));
        const maxX = Math.max(...shapePoints.map((p) => p.x));
        const minY = Math.min(...shapePoints.map((p) => p.y));
        const maxY = Math.max(...shapePoints.map((p) => p.y));
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        return shapePoints.map((p) => ({ x: p.x - cx, y: p.y - cy }));
    }

    function buildWallpaperTargets(shape) {
        const centers = [
            { x: cssW * 0.18, y: cssH * 0.30, s: 1.05 },
            { x: cssW * 0.50, y: cssH * 0.22, s: 0.95 },
            { x: cssW * 0.82, y: cssH * 0.33, s: 1.08 },
            { x: cssW * 0.34, y: cssH * 0.64, s: 0.92 },
            { x: cssW * 0.72, y: cssH * 0.68, s: 0.98 }
        ];
        const out = [];
        centers.forEach((c, groupIndex) => {
            shape.forEach((p, idx) => {
                if (idx % 2 !== 0) return;
                out.push({
                    x: c.x + p.x * c.s,
                    y: c.y + p.y * c.s,
                    g: groupIndex
                });
            });
        });
        return out;
    }

    function setupParticles(shape) {
        targets = buildWallpaperTargets(shape);
        particles = targets.map((t) => ({
            x: t.x + (Math.random() - 0.5) * 180,
            y: t.y + (Math.random() - 0.5) * 160,
            tx: t.x,
            ty: t.y,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.05 + 1.1
        }));
    }

    function animate() {
        ctx.clearRect(0, 0, cssW, cssH);
        for (const p of particles) {
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            p.vx += dx * 0.012;
            p.vy += dy * 0.012;
            if (pointer.active) {
                const rx = p.x - pointer.x;
                const ry = p.y - pointer.y;
                const dist = Math.hypot(rx, ry) || 1;
                if (dist < 90) {
                    p.vx += (rx / dist) * 0.45;
                    p.vy += (ry / dist) * 0.45;
                }
            }
            p.vx *= 0.88;
            p.vy *= 0.88;
            p.x += p.vx;
            p.y += p.vy;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.2);
            grad.addColorStop(0, 'rgba(186, 230, 253, 0.78)');
            grad.addColorStop(0.5, 'rgba(96, 165, 250, 0.30)');
            grad.addColorStop(1, 'rgba(48, 170, 186, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.9, 0, Math.PI * 2);
            ctx.fill();
        }
        rafId = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
    });
    window.addEventListener('mouseleave', () => {
        pointer.active = false;
    });

    const shape = sampleLogoShape();
    if (!shape.length) return;
    resize();
    setupParticles(shape);
    animate();
    window.addEventListener('resize', () => {
        resize();
        setupParticles(shape);
    });
    window.addEventListener('beforeunload', () => {
        if (rafId) cancelAnimationFrame(rafId);
    });
}

window.addEventListener('load', initLogoParticles);
