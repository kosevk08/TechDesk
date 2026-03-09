document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch('https://techdesk-backend.onrender.com/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role
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