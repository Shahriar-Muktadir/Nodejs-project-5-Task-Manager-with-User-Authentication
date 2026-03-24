

// Helper to make authenticated requests
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})

        }
    });
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

function showAuth() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('taskSection').style.display = 'none';
}

function showTasks() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('taskSection').style.display = 'block';
    loadTasks();
}

// Load and display tasks
async function loadTasks() {
    try {
        const tasks = await apiRequest('/api/tasks');
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        if(tasks.length === 0) {
            taskList.innerHTML = '<p>No tasks yet. Add one above!</p>';
            return;
        }
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <h3>${escapeHtml(task.title)}</h3>
                <p>${escapeHtml(task.description || '')}</p>
                <small>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</small>
                <small>Status: ${task.completed ? '✓ Completed' : '⧠ Pending'}</small>
                <div class="task-actions">
                    <button class="complete" data-id="${task._id}">${task.completed ? 'Undo' : 'Complete'}</button>
                    <button class="delete" data-id="${task._id}">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        // Attach event listeners to dynamically added buttons
        document.querySelectorAll('.complete').forEach(btn => {
            btn.addEventListener('click', () => toggleComplete(btn.dataset.id));
        });
        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', () => deleteTask(btn.dataset.id));
        });
    } catch (err) {
        console.error('Failed to load tasks', err);
        document.getElementById('taskList').innerHTML = '<p class="error">Failed to load tasks. Please try again.</p>';

    }
}

// Add new task
async function addTask(title, description, dueDate) {
    const taskData = {title, description};
    if(dueDate) taskData.dueDate = dueDate;
    await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    });
    await loadTasks(); 
}

// Toggle completion
async function toggleComplete(taskId) {
    // first fetch current tasks to get the task's current status
    const tasks = await apiRequest('/api/tasks');
    const task = tasks.find(t => t._id == taskId);
    if(task) {
        const updatedTask = {...task, completed: !task.completed};
        await apiRequest(`/api/tasks/${taskId}`,{
            method: 'PUT',
            body: JSON.stringify(updatedTask)
        });
        await loadTasks();
    }
}
// Delete completion
async function deleteTask(taskId) {
    if(confirm('Delete this task?')) {
        await apiRequest(`/api/tasks/${taskId}`,{ method: 'DELETE' });
        await loadTasks();
    }
}

// Authentication functions
async function register(username, email, password) {
    await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    showTasks();
}

async function login(username, password) {
    await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    showTasks();
}

async function logout() {
    await apiRequest(`/api/auth/logout`,{ method: 'POST' });
    showAuth();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// Simple helper to escape HTML to prevent XSS
function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if(m == '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// DOM elements and event listeners
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    if(!username || !password) {
        alert('Please fill all fields');
        return;
    }
    try{
        await login(username, password);
    } catch(err) {
        alert(err.message);
    }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    if(!username || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    try{
        await register(username, email, password);
    } catch(err) {
        alert(err.message);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logout();
});

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    if(!title) {
        alert('Please enter a task title');
        return;
    }
    const description = document.getElementById('taskDesc').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    try {
        await addTask(title, description, dueDate);
        document.getElementById('taskForm').reset();
    } catch(err) {
        alert('Failed to add task: ' + err.message);
    }
});

// Toggle between login and register forms
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

// check if already logged in when page loads
window.addEventListener('load', async() => {
    try{
        const user = await apiRequest('/api/auth/me');
        if(user){
            showTasks();

        } else{
            showAuth();
        }
    } catch (err) {
        showAuth();
    }
});
