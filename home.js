// ====== UTILITY FUNCTIONS ======
const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#0f0' : '#f00'};
            color: #000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },
    
    getFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },
    
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};

// ====== BARS INITIALIZATION (home: moving festive bars) ======
function createBars() {
    const container = document.getElementById('bars-container');
    if (!container) return;
    if (container.dataset.keysInited) return;

    const colors = [
        'linear-gradient(to top, #2ee84e, rgba(46,232,78,0.6))', // green
        'linear-gradient(to top, #c41e3a, rgba(196,30,58,0.7))', // red
        'linear-gradient(to top, #fad000, rgba(250,208,0,0.6))'  // gold
    ];

    const count = 60;
    for (let i = 0; i < count; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.background = colors[i % colors.length];
        bar.style.animationDelay = ((i % 7) * 0.12) + 's';
        container.appendChild(bar);
    }
    container.dataset.keysInited = '1';
}

// ====== INTRO ANIMATION ======
function initIntro() {
    setTimeout(() => {
        const intro = document.getElementById('intro');
        const homepage = document.getElementById('homepage');
        if (intro && homepage) {
            intro.style.display = 'none';
            homepage.classList.remove('hidden');
            updateCartBadge();
            checkUserSession();
        }
    }, 2300);
}

// ====== USER MENU ======
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.toggle('hidden');
    }
}

document.addEventListener('click', (e) => {
    const navRight = document.querySelector('.nav-right');
    if (navRight && !navRight.contains(e.target)) {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.classList.add('hidden');
        }
    }
});

// ====== CART BADGE ======
function updateCartBadge() {
    try {
        const count = getCartTotal?.();
        const badge = document.getElementById('cartBadge');
        if (badge && typeof count === 'number') {
            badge.textContent = count;
            badge.setAttribute('aria-label', `${count} items in cart`);
        }
    } catch (error) {
        console.error('Error updating cart badge:', error);
    }
}

// ====== HIDE AUTH BUTTONS IF LOGGED IN ======
function hideAuthButtonsIfLoggedIn() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => {
      btn.classList.add('hidden');
    });
  }
}

// ====== USER SESSION ======
function checkUserSession() {
    try {
        const currentUserName = localStorage.getItem('currentUser');
        const userInfo = document.getElementById('userInfo');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (currentUserName && userInfo) {
            userInfo.textContent = `👤 ${currentUserName}`;
            if (logoutBtn) {
                logoutBtn.classList.remove('hidden');
            }
            // Hide login/signup buttons
            hideAuthButtonsIfLoggedIn();
        }
    } catch (error) {
        console.error('Error checking user session:', error);
    }
}

// ====== NAVIGATION ======
function go(page) {
    window.location.href = page + '.html';
}

function scrollToFeatures() {
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ====== CHRISTMAS THEME (December only) ======
function applyChristmasTheme() {
    const today = new Date();
    const isDecember = today.getMonth() === 11;
    // init firebase if config present
    if (window.FIREBASE_CONFIG && window.firebaseHelpers && typeof window.firebaseHelpers.init === 'function') {
        try { window.firebaseHelpers.init(window.FIREBASE_CONFIG); } catch(e){ console.warn(e); }
    }
    const sleigh = document.getElementById('santa-sleigh');
    if (sleigh) sleigh.style.display = isDecember ? 'block' : 'none';
}

// presence update: also push to firebase presence when logged in
function startPresenceLoop() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    // set at load
    try {
        localStorage.setItem('presence_' + currentUser, Date.now().toString());
        if (window.firebaseHelpers && typeof window.firebaseHelpers.setPresence === 'function') {
            window.firebaseHelpers.setPresence(currentUser);
        }
    } catch (e) { /* ignore */ }

    // update every 30 seconds
    setInterval(() => {
        try {
            localStorage.setItem('presence_' + currentUser, Date.now().toString());
            if (window.firebaseHelpers && typeof window.firebaseHelpers.setPresence === 'function') {
                window.firebaseHelpers.setPresence(currentUser);
            }
        } catch (e) { /* ignore */ }
    }, 30000);
}

// ====== INITIALIZATION ======
window.addEventListener('load', () => {
    applyChristmasTheme();
    createBars();
    initIntro();
    hideAuthButtonsIfLoggedIn();
    // start presence if logged in
    startPresenceLoop();
    // continue existing Core.onReady flow
    Core.onReady(() => {
		const intro = document.getElementById('intro');
		const home = document.getElementById('homepage');
		
		setTimeout(() => {
			if (intro) intro.style.display = 'none';
			if (home) home.classList.remove('hidden');
			updateUI();
		}, 2300);

		// close menu on click outside
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.nav-right')) Core.closeMenus();
		});

		function updateUI() {
			const user = Core.getCurrentUser();
			const badge = document.getElementById('cartBadge');
			const userInfo = document.getElementById('userInfo');
			const logoutBtn = document.getElementById('logoutBtn');

			if (badge) badge.textContent = Core.getCart().length;
			
			if (user && userInfo) {
				userInfo.textContent = '👤 ' + user;
				if (logoutBtn) logoutBtn.classList.remove('hidden');
			}
		}
	});
});
