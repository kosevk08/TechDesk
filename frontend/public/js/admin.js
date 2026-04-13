const user = JSON.parse(localStorage.getItem('user'));
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_BASE_URL = isLocalhost ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
const adminKey = 'techdesk-secret-2026';

// Temporary bypass for initial setup if the database is empty
// if (!user || user.role !== 'ADMIN') {
//     window.location.href = '/';
// }

async function fetchUsers() {
    const listContainer = document.getElementById('userList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<p class="empty-state">Loading users...</p>';
    
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/user/all`, {
            headers: { 'X-Admin-Key': adminKey }
        });
        
        if (response.ok) {
            const users = await response.json();
            renderUsers(users);
        } else {
            listContainer.innerHTML = '<p class="empty-state">Failed to load users. Verify Admin Key.</p>';
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        listContainer.innerHTML = '<p class="empty-state">Network error.</p>';
    }
}

function renderUsers(users) {
    const listContainer = document.getElementById('userList');
    listContainer.replaceChildren();

    if (users.length === 0) {
        const p = document.createElement('p');
        p.className = 'empty-state';
        p.textContent = 'No users found.';
        listContainer.appendChild(p);
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>EGN</th>
                <th>Email</th>
                <th>Role</th>
                <th>Demo</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    users.forEach(u => {
        const tr = document.createElement('tr');
        
        const tdEgn = document.createElement('td');
        tdEgn.textContent = u.egn;
        
        const tdEmail = document.createElement('td');
        tdEmail.textContent = u.email;
        
        const tdRole = document.createElement('td');
        const selectRole = document.createElement('select');
        selectRole.className = 'admin-select';
        ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'].forEach(role => {
            const opt = document.createElement('option');
            opt.value = role;
            opt.textContent = role;
            if (u.role === role) opt.selected = true;
            selectRole.appendChild(opt);
        });
        selectRole.addEventListener('change', () => updateUserRole(u.egn, selectRole.value));
        tdRole.appendChild(selectRole);
        
        const tdDemo = document.createElement('td');
        tdDemo.textContent = u.demo ? '✅' : '❌';
        
        const tdActions = document.createElement('td');
        const btnDelete = document.createElement('button');
        btnDelete.className = 'action-btn danger-btn';
        btnDelete.textContent = 'Delete';
        tdActions.appendChild(btnDelete);
        
        tr.append(tdEgn, tdEmail, tdRole, tdDemo, tdActions);
        tbody.appendChild(tr);
    });

    listContainer.appendChild(table);
}

async function updateUserRole(egn, newRole) {
    if (!confirm(`Are you sure you want to change user ${egn} to role ${newRole}?`)) {
        fetchUsers(); // Reset UI
        return;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/user/role/${egn}`, {
            method: 'PUT',
            headers: { 
                'X-Admin-Key': adminKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
            alert('User role updated successfully.');
        } else {
            alert('Failed to update user role.');
            fetchUsers();
        }
    } catch (error) {
        console.error('Error updating role:', error);
        alert('Network error while updating role.');
    }
}

async function runSetup() {
    if (!confirm('Are you sure you want to run the system setup? This will create demo users.')) return;
    const res = await fetch(`${BACKEND_BASE_URL}/api/user/setup`, { headers: { 'X-Admin-Key': adminKey } });
    if (res.ok) { alert('Setup complete!'); fetchUsers(); }
    else { alert('Setup failed.'); }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    document.getElementById('runSetupBtn')?.addEventListener('click', runSetup);
    document.getElementById('refreshUsersBtn')?.addEventListener('click', fetchUsers);
});