const socket = io();
const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = '/';

const shortNames = {
    '1000000001': 'Viktor Kolev',
    '1000000002': 'Konstantin Kosev',
    '1000000003': 'Ivan Ivanov',
    '1000000004': 'John Doe',
    '1000000005': 'Daniel Kovacs',
    '1000000006': 'Sofia Martinez',
    '1000000007': 'Marcus Bennett',
    '1000000008': 'Elena Petrova',
    '1000000009': 'Liam O\'Connor',
    '1000000010': 'Victor Ivanov',
    '1000000011': 'Natalie Fischer',
    '1000000012': 'Carlos Mendes',
    '2000000001': 'Miss Schmidt',
    '2000000002': 'Mr Popescu',
    '3000000001': 'Mr Navarro'
};

const roleLabel = {
    '1000000001': 'Student', '1000000002': 'Student', '1000000003': 'Student',
    '1000000004': 'Student', '1000000005': 'Student', '1000000006': 'Student',
    '1000000007': 'Student', '1000000008': 'Student', '1000000009': 'Student',
    '1000000010': 'Student', '1000000011': 'Student', '1000000012': 'Student',
    '2000000001': 'Teacher', '2000000002': 'Teacher',
    '3000000001': 'Parent'
};

const backLink = document.getElementById('backLink');
if (user.role === 'TEACHER') backLink.innerHTML = '<a href="/teacher">← Back</a>';
else if (user.role === 'STUDENT') backLink.innerHTML = '<a href="/student">← Back</a>';
else if (user.role === 'PARENT') backLink.innerHTML = '<a href="/parent">← Back</a>';

let currentChat = null; // { type: 'private', otherEgn } or { type: 'group' }
let conversations = []; // list of unique people we've talked to

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Load sidebar conversations
async function loadSidebar() {
    try {
        const [inboxRes, outboxRes] = await Promise.all([
            fetch(`http://localhost:8080/api/message/inbox/${user.egn}`),
            fetch(`http://localhost:8080/api/message/outbox/${user.egn}`)
        ]);
        const inbox = await inboxRes.json();
        const outbox = await outboxRes.json();

        const allMessages = [...inbox, ...outbox].filter(m => m.receiverEgn !== 'GROUP' && m.senderEgn !== 'GROUP' || m.receiverEgn === 'GROUP');

        const convMap = {};

        // Private conversations
        [...inbox, ...outbox].forEach(msg => {
            if (msg.receiverEgn === 'GROUP') return;
            const otherEgn = msg.senderEgn === user.egn ? msg.receiverEgn : msg.senderEgn;
            if (!convMap[otherEgn] || new Date(msg.sentAt) > new Date(convMap[otherEgn].sentAt)) {
                convMap[otherEgn] = msg;
            }
        });

        const list = document.getElementById('conversationList');
        list.innerHTML = '';

        // Group chat always at top
        const groupItem = document.createElement('div');
        groupItem.className = 'convo-item' + (currentChat?.type === 'group' ? ' active' : '');
        groupItem.innerHTML = `
            <h4>🏫 Class Group Chat <span class="group-badge">GROUP</span></h4>
            <p>Miss Schmidt, Mr Popescu, students & parents</p>
        `;
        groupItem.onclick = () => openGroupChat();
        list.appendChild(groupItem);

        // Private convos sorted by latest
        Object.entries(convMap)
            .sort((a, b) => new Date(b[1].sentAt) - new Date(a[1].sentAt))
            .forEach(([egn, lastMsg]) => {
                const item = document.createElement('div');
                item.className = 'convo-item' + (currentChat?.type === 'private' && currentChat?.otherEgn === egn ? ' active' : '');
                const preview = lastMsg.senderEgn === user.egn ? `You: ${lastMsg.content}` : lastMsg.content;
                item.innerHTML = `
                    <span class="convo-time">${formatTime(lastMsg.sentAt)}</span>
                    <h4>${shortNames[egn] || egn}</h4>
                    <p>${preview.substring(0, 40)}${preview.length > 40 ? '...' : ''}</p>
                `;
                item.onclick = () => openPrivateChat(egn);
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

    // Group chat
    const groupItem = document.createElement('div');
    groupItem.className = 'person-item';
    groupItem.innerHTML = `
        <div class="person-avatar group">🏫</div>
        <div>
            <h4>Class Group Chat</h4>
            <p>Everyone in class 11D</p>
        </div>
    `;
    groupItem.onclick = () => openGroupChat();
    list.appendChild(groupItem);

    // All people except self
    Object.entries(shortNames).forEach(([egn, name]) => {
        if (egn === user.egn) return;
        const item = document.createElement('div');
        item.className = 'person-item';
        item.innerHTML = `
            <div class="person-avatar">${getInitials(name)}</div>
            <div>
                <h4>${name}</h4>
                <p>${roleLabel[egn]}</p>
            </div>
        `;
        item.onclick = () => openPrivateChat(egn);
        list.appendChild(item);
    });
}

async function openPrivateChat(otherEgn) {
    currentChat = { type: 'private', otherEgn };
    document.getElementById('chatEmpty').style.display = 'none';
    document.getElementById('peoplePicker').style.display = 'none';
    document.getElementById('chatView').style.display = 'flex';
    document.getElementById('chatTitle').textContent = shortNames[otherEgn] || otherEgn;
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

async function loadPrivateMessages() {
    try {
        const res = await fetch(`http://localhost:8080/api/message/conversation/${user.egn}/${currentChat.otherEgn}`);
        const messages = await res.json();
        renderMessages(messages, 'private');
    } catch (err) {
        console.error('Could not load messages:', err);
    }
}

async function loadGroupMessages() {
    try {
        const res = await fetch(`http://localhost:8080/api/message/group`);
        const messages = await res.json();
        renderMessages(messages, 'group');
    } catch (err) {
        console.error('Could not load group messages:', err);
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
        const isMine = msg.senderEgn === user.egn;
        bubble.className = 'message-bubble ' + (isMine ? 'mine' : 'theirs');

        let html = '';
        if (type === 'group' && !isMine) {
            html += `<div class="bubble-sender">${shortNames[msg.senderEgn] || msg.senderEgn}</div>`;
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
    const isMine = msg.senderEgn === user.egn;
    const isGroup = currentChat?.type === 'group';
    bubble.className = 'message-bubble ' + (isMine ? 'mine' : 'theirs');

    let html = '';
    if (isGroup && !isMine) {
        html += `<div class="bubble-sender">${shortNames[msg.senderEgn] || msg.senderEgn}</div>`;
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

    const receiverEgn = currentChat.type === 'group' ? 'GROUP' : currentChat.otherEgn;

    try {
        const res = await fetch('http://localhost:8080/api/message/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderEgn: user.egn, receiverEgn, content })
        });
        const savedMsg = await res.json();
        appendMessage(savedMsg);
        input.value = '';
        input.style.height = 'auto';

        if (currentChat.type === 'group') {
            socket.emit('group-message', savedMsg);
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

// Socket.io live message listeners
socket.on('private-message', (msg) => {
    if (currentChat?.type === 'private' &&
        (msg.senderEgn === currentChat.otherEgn || msg.receiverEgn === currentChat.otherEgn)) {
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

// Init
loadSidebar();