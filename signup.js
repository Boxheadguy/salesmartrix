// ====== SIGNUP PAGE ======

(function(){
  const form = document.getElementById('signupForm');
  const msg = document.getElementById('signupMessage');

  function show(text, color='') {
    if (msg) { msg.textContent = text; msg.style.color = color; }
  }

  function hideAuthButtons() {
    document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => {
      btn.classList.add('hidden');
    });
  }

  function validate(username, email, password, confirm) {
    if (!username || username.length < 3 || username.length > 20) { show('Username 3-20 chars', '#f00'); return false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { show('Invalid email', '#f00'); return false; }
    if (!password || password.length < 6) { show('Password must be 6+ chars', '#f00'); return false; }
    if (password !== confirm) { show('Passwords do not match', '#f00'); return false; }
    return true;
  }

  async function registerRemote(username, email, password) {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, email, password })
      });
      return await res.json();
    } catch (e) {
      return { error: 'network' };
    }
  }

  async function loginRemote(identifier, password) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ identifier, password })
      });
      return await res.json();
    } catch(e) {
      return { error: 'network' };
    }
  }

  function saveLocalUser(username, email, password) {
    const users = JSON.parse(localStorage.getItem('neonUsers') || '[]');
    // check if user already exists
    if (users.some(u => u.username === username)) return false;
    users.push({ username, email, password, createdAt: new Date().toISOString() });
    localStorage.setItem('neonUsers', JSON.stringify(users));
    return true;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (!validate(username, email, password, confirm)) return;

    show('Creating account...', '#0ff');

    // try remote registration first
    const remote = await registerRemote(username, email, password);
    if (remote && remote.success) {
      // on success, auto-login
      const loginRes = await loginRemote(username, password);
      if (loginRes && loginRes.token) {
        localStorage.setItem('authToken', loginRes.token);
        localStorage.setItem('currentUser', loginRes.user.username || username);
        hideAuthButtons();
        show('Account created. Redirecting...', '#0f0');
        setTimeout(() => location.href = 'home.html', 900);
        return;
      } else {
        // remote registration succeeded but login failed (rare)
        localStorage.setItem('currentUser', username);
        hideAuthButtons();
        show('Registered — please login', '#0f0');
        setTimeout(() => location.href = 'login.html', 900);
        return;
      }
    }

    // fallback: if network error, save locally
    if (remote && remote.error === 'network') {
      if (saveLocalUser(username, email, password)) {
        localStorage.setItem('currentUser', username);
        hideAuthButtons();
        show('Saved locally (offline). You are logged in locally.', '#0f0');
        setTimeout(() => location.href = 'home.html', 900);
      } else {
        show('Username already exists', '#f00');
      }
      return;
    }

    // backend returned an error
    show((remote && remote.error) ? remote.error : 'Registration failed', '#f00');
  });

  // hide auth buttons on page load if already logged in
  if (localStorage.getItem('currentUser')) {
    hideAuthButtons();
  }
})();

// Intro animation
setTimeout(() => {
    const intro = document.getElementById('intro');
    const page = document.getElementById('signup-page');
    if (intro && page) {
        intro.style.display = 'none';
        page.classList.remove('hidden');
    }
}, 2300);
