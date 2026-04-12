(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;

    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
    const token = localStorage.getItem('token');

    const launch = document.createElement('div');
    launch.className = 'feedback-launch';
    launch.innerHTML = `<button class="feedback-btn" type="button">Report A Problem</button>`;

    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
    modal.innerHTML = `
        <div class="feedback-card">
            <h3>Report A Problem</h3>
            <p>Tell us what went wrong. Your note helps us improve TechDesk quickly.</p>
            <div class="feedback-field">
                <label for="feedbackSeverity">Severity</label>
                <select id="feedbackSeverity">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div class="feedback-field">
                <label for="feedbackContact">Contact (optional)</label>
                <input id="feedbackContact" type="email" placeholder="email@example.com" />
            </div>
            <div class="feedback-field">
                <label for="feedbackMessage">What happened?</label>
                <textarea id="feedbackMessage" rows="4" placeholder="Describe the issue..."></textarea>
            </div>
            <div class="feedback-actions">
                <button class="feedback-cancel" type="button">Cancel</button>
                <span class="feedback-status" id="feedbackStatus"></span>
                <button class="feedback-submit" type="button">Send</button>
            </div>
        </div>
    `;

    document.body.appendChild(launch);
    document.body.appendChild(modal);

    const openBtn = launch.querySelector('button');
    const cancelBtn = modal.querySelector('.feedback-cancel');
    const submitBtn = modal.querySelector('.feedback-submit');
    const status = modal.querySelector('#feedbackStatus');

    function openModal() {
        modal.classList.add('active');
        status.textContent = '';
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    openBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    submitBtn.addEventListener('click', async () => {
        const severity = modal.querySelector('#feedbackSeverity').value;
        const contact = modal.querySelector('#feedbackContact').value.trim();
        const message = modal.querySelector('#feedbackMessage').value.trim();
        if (message.length < 6) {
            status.textContent = 'Please add more detail.';
            return;
        }

        const payload = {
            severity,
            contact,
            message,
            page: document.title,
            url: window.location.href,
            clientTime: new Date().toISOString()
        };

        if (user.demo) {
            const stored = JSON.parse(localStorage.getItem('demo-feedback') || '[]');
            stored.unshift({
                id: Date.now(),
                severity,
                page: document.title,
                message,
                createdAt: payload.clientTime,
                sender: user.displayName || 'Demo User'
            });
            localStorage.setItem('demo-feedback', JSON.stringify(stored));
            status.textContent = 'Saved locally (demo).';
            setTimeout(closeModal, 800);
            return;
        }

        try {
            const res = await fetch(`${BACKEND_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Request failed');
            status.textContent = 'Thank you. We received your report.';
            setTimeout(closeModal, 800);
        } catch (error) {
            status.textContent = 'Could not send. Try again.';
        }
    });
})();
