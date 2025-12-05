// User Management
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

function findUser(email) {
    return getUsers().find(u => u.email === email);
}

function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if(!userId) return null;
    return JSON.parse(localStorage.getItem('user_' + userId));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUserId', user.id);
    localStorage.setItem('user_' + user.id, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('currentUserId');
    window.location.href = 'home.html';
}

// Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}
