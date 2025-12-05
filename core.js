// Core utilities shared across all pages

const Core = {
  // DOM ready helper
  onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  },

  // Storage
  getLS(key, def = null) {
    try { return JSON.parse(localStorage.getItem(key)) || def; } 
    catch(e) { return def; }
  },
  setLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } 
    catch(e) { console.error('Storage error:', e); }
  },

  // User
  getCurrentUser() {
    return localStorage.getItem('currentUser');
  },
  getUsers() {
    return Core.getLS('neonUsers', []);
  },
  saveUsers(users) {
    Core.setLS('neonUsers', users);
  },
  getCart() {
    return Core.getLS('cart', []);
  },
  saveCart(cart) {
    Core.setLS('cart', cart);
  },

  // Validation
  validateUsername(u) { return u && u.length >= 3 && u.length <= 20; },
  validatePassword(p) { return p && p.length >= 6; },
  validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); },

  // HTML escape
  escape(s) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(s || '').replace(/[&<>"']/g, c => map[c]);
  },

  // Notify
  notify(msg, type = 'info', dur = 3000) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = `position:fixed;top:20px;right:20px;padding:1rem;border-radius:8px;z-index:5000;background:${type === 'success' ? '#0f0' : type === 'error' ? '#f00' : '#0ff'};color:#000;font-weight:700;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur);
  },

  // Debounce
  debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  },

  // Nav
  go(page) { window.location.href = page + '.html'; },
  toggleMenu(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden');
  },
  closeMenus() {
    document.querySelectorAll('.user-menu').forEach(m => m.classList.add('hidden'));
  },

  // Presence
  updatePresence(user) {
    if (!user) return;
    Core.setLS('presence_' + user, Date.now());
    // also push to Firebase presence (best-effort)
    if (window.firebaseHelpers && typeof window.firebaseHelpers.setPresence === 'function') {
        try { window.firebaseHelpers.setPresence(user); } catch(e){ /* ignore */ }
    }
  },
  isOnline(user) {
    const t = parseInt(Core.getLS('presence_' + user, 0), 10);
    return (Date.now() - t) < 2 * 60 * 1000;
  },

  // Init bars
  createBars() {
    const c = document.getElementById('bars-container');
    if (!c || c.dataset.inited) return;
    const count = 50;
    const isHome = !!document.getElementById('homepage');
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      if (isHome) {
        el.className = 'bar';
        el.style.animationDelay = (i * 0.05) + 's';
      } else {
        el.className = 'piano-key ' + (i % 2 === 0 ? 'white' : 'black');
        el.style.animationDelay = (i * 0.03) + 's';
      }
      el.setAttribute('aria-hidden', 'true');
      c.appendChild(el);
    }
    c.dataset.inited = '1';
  }
};

// Global nav functions
function go(page) { Core.go(page); }
function toggleUserMenu() { Core.toggleMenu('userMenu'); }
function logoutUser() { 
  if (confirm('Logout?')) { 
    localStorage.removeItem('currentUser'); 
    go('login'); 
  } 
}
