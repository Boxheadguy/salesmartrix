// ====== UTILITY FUNCTIONS ======
const Utils = {
    showMessage(element, text, color, duration = 3000) {
        if (!element) return;
        element.textContent = text;
        element.style.color = color;
        setTimeout(() => {
            element.textContent = '';
        }, duration);
    },
    
    validateUsername(username) {
        return username && username.length >= 3 && username.length <= 20;
    },
    
    validatePassword(password) {
        return password && password.length >= 6;
    }
};

// ====== STORAGE MANAGEMENT (reload on access) ======
function getUsers() {
    return JSON.parse(localStorage.getItem('neonUsers')) || [];
}

function getActivities() {
    return JSON.parse(localStorage.getItem('recentActivities')) || [];
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

// ====== STORAGE HELPERS ======
function saveUsers(usersArr){
	// write to localStorage
	localStorage.setItem('neonUsers', JSON.stringify(usersArr || getUsers()));
	// also push to Firebase if available (best-effort)
	if(window.firebaseHelpers && typeof window.firebaseHelpers.saveUser === 'function'){
		(usersArr || getUsers()).forEach(u => {
			try { window.firebaseHelpers.saveUser(u); } catch(e){ /* ignore */ }
		});
	}
}

// ====== INIT ======
function initSettings() {
    const currentUser = getCurrentUser();
    
    // Redirect if not logged in
    if (!currentUser) {
        alert('No user logged in! Redirecting to login...');
        window.location.href = 'login.html';
        return;
    }

    setTimeout(() => {
        const intro = document.getElementById('intro');
        const settingsPage = document.getElementById('settings-page');
        if (intro && settingsPage) {
            intro.style.display = 'none';
            settingsPage.classList.remove('hidden');
            loadUserProfile();
            displayActivities();
            displayAllUsers();
            // Hide login/signup buttons for logged-in users
            document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => {
                btn.classList.add('hidden');
            });
        }
    }, 2500);
}

// ====== DOM ELEMENTS (lazy load) ======
function getProfilePic() { return document.getElementById('profilePic'); }
function getPicInput() { return document.getElementById('picInput'); }
function getUsernameChange() { return document.getElementById('usernameChange'); }
function getPasswordChange() { return document.getElementById('passwordChange'); }
function getSaveChangesBtn() { return document.getElementById('saveChangesBtn'); }
function getMessage() { return document.getElementById('settingsMessage'); }
function getActivityLog() { return document.getElementById('activityLog'); }
function getUsersList() { return document.getElementById('usersList'); }

// ====== PROFILE PICTURE ======
function loadUserProfile() {
    const currentUser = getCurrentUser();
    const users = getUsers();
    const currentUserData = users.find(u => u.username === currentUser);
    
    const profilePic = getProfilePic();
    const usernameChange = getUsernameChange();
    const passwordChange = getPasswordChange();
    
    if (currentUserData?.profilePic && profilePic) {
        profilePic.src = currentUserData.profilePic;
    }
    
    if (usernameChange) usernameChange.value = '';
    if (passwordChange) passwordChange.value = '';
}

function setupProfilePictureUpload() {
    const picInput = getPicInput();
    const message = getMessage();
    
    if (!picInput) return;
    
    picInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Utils.showMessage(message, 'File too large (max 5MB)', '#f00');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            Utils.showMessage(message, 'Please select an image file', '#f00');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const currentUser = getCurrentUser();
            let users = getUsers();
            const currentUserData = users.find(u => u.username === currentUser);
            
            if (currentUserData && getProfilePic()) {
                getProfilePic().src = e.target.result;
                currentUserData.profilePic = e.target.result;
                // SAVE via helper
                saveUsers(users);
                // log activity and notify
                logActivity('Changed profile picture');
                Utils.showMessage(message, 'Profile picture updated!', '#0f0');
            }
        };
        reader.onerror = () => {
            Utils.showMessage(message, 'Error reading file', '#f00');
        };
        reader.readAsDataURL(file);
    });
}

function setupSaveChanges() {
    const saveChangesBtn = getSaveChangesBtn();
    const message = getMessage();
    
    if (!saveChangesBtn) return;
    
    saveChangesBtn.addEventListener('click', async () => {
        const currentUser = getCurrentUser();
        let users = getUsers();
        const currentUserData = users.find(u => u.username === currentUser);
        
        if (!currentUserData) return;
        
        const usernameChange = getUsernameChange();
        const passwordChange = getPasswordChange();
        let hasChanges = false;
        
        // Username change
        if (usernameChange && usernameChange.value) {
            if (!Utils.validateUsername(usernameChange.value)) {
                Utils.showMessage(message, 'Username must be 3-20 characters', '#f00');
                return;
            }
            
            const usernameExists = users.some(u => u.username === usernameChange.value);
            if (usernameExists) {
                Utils.showMessage(message, 'Username already taken', '#f00');
                return;
            }
            
            logActivity(`Username changed from ${currentUser} to ${usernameChange.value}`);
            currentUserData.username = usernameChange.value;
            localStorage.setItem('currentUser', usernameChange.value);
            usernameChange.value = '';
            hasChanges = true;
        }
        
        // Password change
        if (passwordChange && passwordChange.value) {
            if (!Utils.validatePassword(passwordChange.value)) {
                Utils.showMessage(message, 'Password must be at least 6 characters', '#f00');
                return;
            }
            
            logActivity('Password changed');
            currentUserData.password = passwordChange.value;
            passwordChange.value = '';
            hasChanges = true;
        }
        
        if (hasChanges) {
            // use saveUsers -> writes local and pushes to Firebase
            saveUsers(users);
            Utils.showMessage(message, 'Changes saved successfully!', '#0f0');
        } else {
            Utils.showMessage(message, 'No changes to save', '#ff0');
        }
    });
}

// ====== DISPLAY ALL USERS (prefer Firebase) ======
async function displayAllUsers() {
    const usersList = getUsersList();
    if (!usersList) return;
    
    usersList.innerHTML = '';
    
    let allUsers = getUsers();
    // if firebase available, try to fetch live users
    if (window.firebaseHelpers && typeof window.firebaseHelpers.fetchUsers === 'function') {
        try {
            const remote = await window.firebaseHelpers.fetchUsers();
            if (Array.isArray(remote) && remote.length) {
                allUsers = remote;
                // also mirror to localStorage for offline use
                localStorage.setItem('neonUsers', JSON.stringify(allUsers));
            }
        } catch (e) {
            console.warn('Firebase fetchUsers failed, falling back to local', e);
        }
    }
    
    if (allUsers.length === 0) {
        usersList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #aaa;">No users registered yet</p>';
        return;
    }
    
    allUsers.forEach(user => {
        const isOnline = isUserOnline(user.username);
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <div class="presence-indicator ${isOnline ? 'online-indicator' : 'offline-indicator'}"></div>
            <div class="user-avatar">${escapeHtml((user.username||'')[0] || '?').toUpperCase()}</div>
            <h3>${escapeHtml(user.username)}</h3>
            <p class="user-email">${escapeHtml(user.email || 'No email')}</p>
            <div class="user-status ${isOnline ? 'status-online' : 'status-offline'}">
                ${isOnline ? '🟢 Online' : '⚫ Offline'}
            </div>
        `;
        usersList.appendChild(userCard);
    });
}

// ====== CHECK USER ONLINE STATUS ======
function isUserOnline(username) {
    const presenceKey = 'presence_' + username;
    const lastSeen = parseInt(localStorage.getItem(presenceKey), 10) || 0;
    return (Date.now() - lastSeen) < 2 * 60 * 1000; // 2 minutes
}

// ====== HTML ESCAPE ======
function escapeHtml(s) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(s || '').replace(/[&<>"']/g, c => map[c]);
}

// ====== LOGGING ======
function logActivity(action) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    let activities = getActivities();
    const entry = {
        user: currentUser,
        action: action,
        time: Date.now()
    };
    activities.push(entry);
    localStorage.setItem('recentActivities', JSON.stringify(activities));
    displayActivities();
}

// ====== DISPLAY ACTIVITIES ======
function displayActivities() {
    const activityLog = getActivityLog();
    if (!activityLog) return;
    
    const currentUser = getCurrentUser();
    activityLog.innerHTML = '';
    const activities = getActivities();
    const userActivities = activities
        .filter(a => a.user === currentUser)
        .slice(-15)
        .reverse();
    
    if (userActivities.length === 0) {
        activityLog.innerHTML = '<p style="color: #aaa;">No activities yet</p>';
        return;
    }
    
    userActivities.forEach(a => {
        const date = new Date(a.time).toLocaleString();
        const div = document.createElement('div');
        div.style.cssText = 'padding: 0.5rem 0; border-bottom: 1px solid #0ff; color: #aaa;';
        div.innerHTML = `<small>[${date}]</small> <span style="color: #0ff;">${escapeHtml(a.action)}</span>`;
        activityLog.appendChild(div);
    });
}

// ====== NAVIGATION ======
function go(page) {
    window.location.href = page + '.html';
}

// ====== LOGOUT ======
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken'); // also clear token
        logActivity('Logged out');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

// ====== HIDE AUTH BUTTONS IF LOGGED IN ======
function hideAuthButtonsIfLoggedIn() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => {
      btn.classList.add('hidden');
    });
  }
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
    hideAuthButtonsIfLoggedIn(); // hide auth buttons on load
    initSettings();
    setupProfilePictureUpload();
    setupSaveChanges();
});

// Refresh user list every 30 seconds to update online/offline status
setInterval(() => {
    displayAllUsers();
}, 30000);
