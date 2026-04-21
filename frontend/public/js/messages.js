const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const socket = io('https://techdesk-frontend.onrender.com');
const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = '/';
const token = localStorage.getItem('token');
const demoData = window.DemoData;
const isDemo = Boolean(user && user.demo);
const CLASSROOM_LOCK_STORAGE_KEY = 'techdesk_classroom_lock';

function authHeaders(extra = {}) {
    const headers = token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
    if (user?.email) headers['X-User-Email'] = user.email;
    if (user?.egn) headers['X-User-Egn'] = user.egn;
    return headers;
}

let userClassName = null;
let teacherClasses = [];
let peopleList = [];

const backLink = document.getElementById('backLink');
if (user.role === 'TEACHER') backLink.innerHTML = '<a href="/teacher">← Back</a>';
else if (user.role === 'STUDENT') backLink.innerHTML = '<a href="/student">← Back</a>';
else if (user.role === 'PARENT') backLink.innerHTML = '<a href="/parent">← Back</a>';

let currentChat = null;

function readStoredClassroomLock() {
    try {
        const raw = localStorage.getItem(CLASSROOM_LOCK_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && parsed.enabled ? parsed : null;
    } catch {
        return null;
    }
}

function enforceNotebookLockIfNeeded() {
    const lock = readStoredClassroomLock();
    if (lock?.enabled) {
        window.location.href = '/notebook';
    }
}

enforceNotebookLockIfNeeded();

async function resolveUserClass() {
    if (isDemo && demoData) {
        userClassName = demoData.messages.className;
        teacherClasses = [demoData.messages.className];
        return;
    }
    if (user.role === 'STUDENT') {
        userClassName = user.className || null;
        if (!userClassName) {
            try {
                const meRes = await fetch(`${BACKEND_BASE_URL}/api/student/me?t=${Date.now()}`, {
                    headers: authHeaders()
                });
                if (meRes.ok) {
                    const profile = await meRes.json();
                    userClassName = profile?.className || null;
                }
            } catch (err) {
                console.warn('Could not resolve student class via /api/student/me:', err);
            }
        }
    } else if (user.role === 'PARENT') {
        userClassName = user.childClassName || null;
    } else if (user.role === 'TEACHER') {
        const res = await fetch(`${BACKEND_BASE_URL}/api/tests/classes`, {
            headers: authHeaders()
        });
        if (res.ok) {
            teacherClasses = await res.json();
        }
    }
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

async function loadPeople() {
    if (isDemo) return;
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/user/people`, { headers: authHeaders() });
        peopleList = res.ok ? await res.json() : [];
    } catch (err) {
        peopleList = [];
    }
}

async function loadSidebar() {
    try {
        if (isDemo && demoData) {
            const list = document.getElementById('conversationList');
            list.innerHTML = '';

            if (userClassName) {
                const classItem = document.createElement('div');
                classItem.className = 'convo-item' + (currentChat?.type === 'class' ? ' active' : '');
                classItem.innerHTML = `
                    <h4>Class ${userClassName} <span class="group-badge">CLASS</span></h4>
                    <p>Classroom announcements & messages</p>
                `;
                classItem.onclick = () => openClassChat(userClassName);
                list.appendChild(classItem);
            }

            if (user.role === 'TEACHER') {
                const annItem = document.createElement('div');
                annItem.className = 'convo-item' + (currentChat?.type === 'announcement' ? ' active' : '');
                annItem.innerHTML = `
                    <h4>School Announcements <span class="group-badge">INFO</span></h4>
                    <p>Send to all students and parents</p>
                `;
                annItem.onclick = () => openAnnouncementChat();
                list.appendChild(annItem);
            }

            demoData.messages.threads.forEach(thread => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                const item = document.createElement('div');
                item.className = 'convo-item' + (currentChat?.type === 'private' && currentChat?.otherName === thread.otherName ? ' active' : '');
                const preview = lastMsg.content;
                item.innerHTML = `
                    <span class="convo-time">${formatTime(lastMsg.sentAt)}</span>
                    <h4>${thread.otherName}</h4>
                    <p>${preview.substring(0, 40)}${preview.length > 40 ? '...' : ''}</p>
                `;
                item.onclick = () => openPrivateChat(thread.otherName);
                list.appendChild(item);
            });
            return;
        }
        const [inboxRes, outboxRes] = await Promise.all([
            fetch(`${BACKEND_BASE_URL}/api/message/inbox/me`, { headers: authHeaders() }),
            fetch(`${BACKEND_BASE_URL}/api/message/outbox/me`, { headers: authHeaders() })
        ]);
        const inbox = await inboxRes.json();
        const outbox = await outboxRes.json();

        const convMap = {};
        [...inbox, ...outbox].forEach(msg => {
            const otherName = msg.mine ? msg.receiverName : msg.senderName;
            if (!otherName) return;
            const isSystemThread =
                /^Class\s+/i.test(String(otherName)) ||
                /^School Announcements$/i.test(String(otherName)) ||
                /^Group$/i.test(String(otherName));
            if (isSystemThread) return;
            if (!convMap[otherName] || new Date(msg.sentAt) > new Date(convMap[otherName].sentAt)) {
                convMap[otherName] = msg;
            }
        });

        const list = document.getElementById('conversationList');
        list.innerHTML = '';

        if (userClassName) {
            const classItem = document.createElement('div');
            classItem.className = 'convo-item' + (currentChat?.type === 'class' ? ' active' : '');
            classItem.innerHTML = `
                <h4>Class ${userClassName} <span class="group-badge">CLASS</span></h4>
                <p>Classroom announcements & messages</p>
            `;
            classItem.onclick = () => openClassChat(userClassName);
            list.appendChild(classItem);
        }

        if (user.role === 'TEACHER') {
            const annItem = document.createElement('div');
            annItem.className = 'convo-item' + (currentChat?.type === 'announcement' ? ' active' : '');
            annItem.innerHTML = `
                <h4>School Announcements <span class="group-badge">INFO</span></h4>
                <p>Send to all students and parents</p>
            `;
            annItem.onclick = () => openAnnouncementChat();
            list.appendChild(annItem);
        }

        Object.entries(convMap)
            .sort((a, b) => new Date(b[1].sentAt) - new Date(a[1].sentAt))
            .forEach(([name, lastMsg]) => {
                const item = document.createElement('div');
                item.className = 'convo-item' + (currentChat?.type === 'private' && currentChat?.otherName === name ? ' active' : '');
                const preview = lastMsg.mine ? `You: ${lastMsg.content}` : lastMsg.content;
                item.innerHTML = `
                    <span class="convo-time">${formatTime(lastMsg.sentAt)}</span>
                    <h4>${name}</h4>
                    <p>${preview.substring(0, 40)}${preview.length > 40 ? '...' : ''}</p>
                `;
                item.onclick = () => openPrivateChat(name);
                list.appendChild(item);
            });

    } catch (err) {
        console.error('Could not load sidebar:', err);
    }
}

function showPeopleList() {
    document.getElementById('chatEmpty').style.display = 'none';
    document.getElementById('chatView').style.display = 'none';
    document.getElementById('peoplePicker').style.display = 'block';

    const list = document.getElementById('peopleList');
    list.innerHTML = '';

    if (isDemo && demoData) {
        const classItem = document.createElement('div');
        classItem.className = 'person-item';
        classItem.innerHTML = `
            <div class="person-avatar group">🏫</div>
            <div>
                <h4>Class ${demoData.messages.className} Chat</h4>
                <p>Everyone in ${demoData.messages.className}</p>
            </div>
        `;
        classItem.onclick = () => openClassChat(demoData.messages.className);
        list.appendChild(classItem);

        if (user.role === 'TEACHER') {
            const annItem = document.createElement('div');
            annItem.className = 'person-item';
            annItem.innerHTML = `
                <div class="person-avatar group">📢</div>
                <div>
                    <h4>School Announcement</h4>
                    <p>Send to all</p>
                </div>
            `;
            annItem.onclick = () => openAnnouncementChat();
            list.appendChild(annItem);
        }

        demoData.messages.threads.forEach(thread => {
            const item = document.createElement('div');
            item.className = 'person-item';
            item.innerHTML = `
                <div class="person-avatar">${getInitials(thread.otherName)}</div>
                <div>
                    <h4>${thread.otherName}</h4>
                    <p>User</p>
                </div>
            `;
            item.onclick = () => openPrivateChat(thread.otherName);
            list.appendChild(item);
        });
        return;
    }

    if (userClassName) {
        const groupItem = document.createElement('div');
        groupItem.className = 'person-item';
        groupItem.innerHTML = `
            <div class="person-avatar group">🏫</div>
            <div>
                <h4>Class ${userClassName} Chat</h4>
                <p>Everyone in ${userClassName}</p>
            </div>
        `;
        groupItem.onclick = () => openClassChat(userClassName);
        list.appendChild(groupItem);
    }

    if (user.role === 'TEACHER') {
        teacherClasses.forEach(cls => {
            const item = document.createElement('div');
            item.className = 'person-item';
            item.innerHTML = `
                <div class="person-avatar group">🏫</div>
                <div>
                    <h4>Class ${cls}</h4>
                    <p>Send to class ${cls}</p>
                </div>
            `;
            item.onclick = () => openClassChat(cls);
            list.appendChild(item);
        });

        const annItem = document.createElement('div');
        annItem.className = 'person-item';
        annItem.innerHTML = `
            <div class="person-avatar group">📢</div>
            <div>
                <h4>School Announcement</h4>
                <p>Send to all</p>
            </div>
        `;
        annItem.onclick = () => openAnnouncementChat();
        list.appendChild(annItem);
    }

    peopleList.forEach(person => {
        if (!person?.displayName) return;
        const item = document.createElement('div');
        item.className = 'person-item';
        item.innerHTML = `
            <div class="person-avatar">${getInitials(person.displayName)}</div>
            <div>
                <h4>${person.displayName}</h4>
                <p>${person.role || 'User'}</p>
            </div>
        `;
        item.onclick = () => openPrivateChat(person.displayName);
        list.appendChild(item);
    });
}

async function openPrivateChat(otherName) {
    currentChat = { type: 'private', otherName };
    document.getElementById('chatEmpty').style.display = 'none';
    document.getElementById('peoplePicker').style.display = 'none';
    document.getElementById('chatView').style.display = 'flex';
    document.getElementById('chatTitle').textContent = otherName || 'User';
    document.getElementById('chatInput').focus();
    loadSidebar();
    await loadPrivateMessages();
}

async function openGroupChat() {
    currentChat = { type: 'group' };
    document.getElementById('chatEmpty').style.display = 'none';
    document.getElementById('peoplePicker').style.display = 'none';
    document.getElementById('chatView').style.display = 'flex';
    document.getElementById('chatTitle').textContent = '🏫 Class Group Chat';
    document.getElementById('chatInput').focus();
    loadSidebar();
    await loadGroupMessages();
}

async function openClassChat(className) {
    currentChat = { type: 'class', className };
    document.getElementById('chatEmpty').style.display = 'none';
    document.getElementById('peoplePicker').style.display = 'none';
    document.getElementById('chatView').style.display = 'flex';
    document.getElementById('chatTitle').textContent = `Class ${className}`;
    document.getElementById('chatInput').focus();
    loadSidebar();
    await loadClassMessages(className);
}

async function openAnnouncementChat() {
    currentChat = { type: 'announcement' };
    document.getElementById('chatEmpty').style.display = 'none';
    document.getElementById('peoplePicker').style.display = 'none';
    document.getElementById('chatView').style.display = 'flex';
    document.getElementById('chatTitle').textContent = 'School Announcements';
    document.getElementById('chatInput').focus();
    loadSidebar();
    await loadAnnouncements();
}

async function loadPrivateMessages() {
    try {
        if (isDemo && demoData) {
            const thread = demoData.messages.threads.find(t => t.otherName === currentChat.otherName);
            renderMessages(thread ? thread.messages : [], 'private');
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/message/conversation/name/${encodeURIComponent(currentChat.otherName)}`, {
            headers: authHeaders()
        });
        const messages = await res.json();
        renderMessages(messages, 'private');
    } catch (err) {
        console.error('Could not load messages:', err);
    }
}

async function loadGroupMessages() {
    try {
        if (isDemo && demoData) {
            renderMessages(demoData.messages.classMessages, 'group');
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/message/group`, {
            headers: authHeaders()
        });
        const messages = await res.json();
        renderMessages(messages, 'group');
    } catch (err) {
        console.error('Could not load group messages:', err);
    }
}

async function loadClassMessages(className) {
    try {
        if (isDemo && demoData) {
            renderMessages(demoData.messages.classMessages, 'class');
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/message/class/${className}`, {
            headers: authHeaders()
        });
        const messages = await res.json();
        renderMessages(messages, 'class');
    } catch (err) {
        console.error('Could not load class messages:', err);
    }
}

async function loadAnnouncements() {
    try {
        if (isDemo && demoData) {
            renderMessages(demoData.messages.announcements, 'announcement');
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/message/announcements`, {
            headers: authHeaders()
        });
        const messages = await res.json();
        renderMessages(messages, 'announcement');
    } catch (err) {
        console.error('Could not load announcements:', err);
    }
}

function renderMessages(messages, type) {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    let lastDate = '';

    messages.forEach(msg => {
        const msgDate = formatDate(msg.sentAt);
        if (msgDate !== lastDate) {
            const divider = document.createElement('div');
            divider.className = 'date-divider';
            divider.textContent = msgDate;
            container.appendChild(divider);
            lastDate = msgDate;
        }

        const bubble = document.createElement('div');
        const isMine = msg.senderName && user.displayName ? msg.senderName === user.displayName : Boolean(msg.mine);
        bubble.className = 'message-bubble ' + (isMine ? 'mine' : 'theirs');

        let html = '';
        if ((type === 'group' || type === 'class' || type === 'announcement') && !isMine) {
            html += `<div class="bubble-sender">${msg.senderName || 'User'}</div>`;
        }
        html += `<div>${msg.content}</div>`;
        html += `<div class="bubble-time">${formatTime(msg.sentAt)}</div>`;
        bubble.innerHTML = html;
        container.appendChild(bubble);
    });

    container.scrollTop = container.scrollHeight;
}

function appendMessage(msg) {
    const container = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    const isMine = msg.senderName && user.displayName ? msg.senderName === user.displayName : Boolean(msg.mine);
    const isGroup = currentChat?.type === 'group' || currentChat?.type === 'class' || currentChat?.type === 'announcement';
    bubble.className = 'message-bubble ' + (isMine ? 'mine' : 'theirs');

    let html = '';
    if (isGroup && !isMine) {
        html += `<div class="bubble-sender">${msg.senderName || 'User'}</div>`;
    }
    html += `<div>${msg.content}</div>`;
    html += `<div class="bubble-time">${formatTime(msg.sentAt)}</div>`;
    bubble.innerHTML = html;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

async function sendCurrentMessage() {
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if (!content || !currentChat) return;

    const receiverType = currentChat.type === 'group'
        ? 'GROUP'
        : currentChat.type === 'class'
            ? 'CLASS'
            : currentChat.type === 'announcement'
                ? 'ANNOUNCEMENT'
                : 'PRIVATE';

    const receiverName = currentChat.type === 'class'
        ? currentChat.className
        : currentChat.type === 'announcement'
            ? 'School'
            : currentChat.otherName;

    try {
        if (isDemo && demoData) {
            const savedMsg = {
                senderName: user.displayName || 'You',
                receiverName,
                content,
                sentAt: new Date().toISOString(),
                mine: true
            };
            if (currentChat.type === 'class') {
                demoData.messages.classMessages.push(savedMsg);
            } else if (currentChat.type === 'announcement') {
                demoData.messages.announcements.push(savedMsg);
            } else {
                let thread = demoData.messages.threads.find(t => t.otherName === currentChat.otherName);
                if (!thread) {
                    thread = {
                        otherName: currentChat.otherName,
                        messages: []
                    };
                    demoData.messages.threads.push(thread);
                }
                thread.messages.push(savedMsg);
            }
            appendMessage(savedMsg);
            input.value = '';
            input.style.height = 'auto';
            loadSidebar();
            return;
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/message/send`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ receiverType, receiverName, content })
        });
        if (!res.ok) {
            throw new Error(`Send failed ${res.status}`);
        }
        const savedMsg = await res.json();
        appendMessage(savedMsg);
        input.value = '';
        input.style.height = 'auto';

        if (currentChat.type === 'group') {
            socket.emit('group-message', savedMsg);
        } else if (currentChat.type === 'class') {
            socket.emit('class-message', savedMsg);
        } else if (currentChat.type === 'announcement') {
            socket.emit('announcement', savedMsg);
        } else {
            socket.emit('private-message', savedMsg);
        }

        loadSidebar();
    } catch (err) {
        console.error('Could not send message:', err);
    }
}

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendCurrentMessage();
    }
}

function backToList() {
    currentChat = null;
    document.getElementById('chatView').style.display = 'none';
    document.getElementById('peoplePicker').style.display = 'none';
    document.getElementById('chatEmpty').style.display = 'flex';
    loadSidebar();
}

if (!isDemo) {
    socket.on('classroom-lock', (data) => {
        const lockState = {
            enabled: true,
            className: data?.className || null,
            onlyNotebook: Boolean(data?.onlyNotebook),
            subject: data?.subject || null,
            subjectId: data?.subjectId || null,
            notebookPage: Number(data?.notebookPage || 1),
            message: data?.message || 'Teacher focus mode is active.'
        };
        localStorage.setItem(CLASSROOM_LOCK_STORAGE_KEY, JSON.stringify(lockState));
        enforceNotebookLockIfNeeded();
    });

    socket.on('classroom-unlock', () => {
        localStorage.removeItem(CLASSROOM_LOCK_STORAGE_KEY);
    });

    socket.on('private-message', (msg) => {
        if (currentChat?.type === 'private' &&
            (msg.senderName === currentChat.otherName || msg.receiverName === currentChat.otherName)) {
            appendMessage(msg);
        }
        loadSidebar();
    });

    socket.on('group-message', (msg) => {
        if (currentChat?.type === 'group') {
            appendMessage(msg);
        }
        loadSidebar();
    });

    socket.on('class-message', (msg) => {
        if (currentChat?.type === 'class') {
            appendMessage(msg);
        }
        loadSidebar();
    });

    socket.on('announcement', (msg) => {
        if (currentChat?.type === 'announcement') {
            appendMessage(msg);
        }
        loadSidebar();
    });
}

Promise.all([resolveUserClass(), loadPeople()]).then(loadSidebar);
