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
        errorMsg.textContent = 'Could not connect to server. Please try again.';
    }
});

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