// Intro logic
setTimeout(()=>{
    document.getElementById('intro').style.display='none';
    document.getElementById('login-page').classList.remove('hidden');
},2300);

// Neon-style storage for users
let users = JSON.parse(localStorage.getItem('neonUsers')) || [];
let loggedInUser = localStorage.getItem('currentUser');

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const message = document.getElementById('authMessage');

// Check if already logged in
function checkLogin(){
    if(loggedInUser){
        loginBtn.classList.add('hidden');
        signupBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        message.textContent = `Logged in as ${loggedInUser}`;
    }
}
checkLogin();

// Signup - redirect to signup page
signupBtn.addEventListener('click', ()=>{
    window.location.href='signup.html';
});

// Login
loginBtn.addEventListener('click', ()=>{
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const user = users.find(u=>u.username===username && u.password===password);
    if(user){
        localStorage.setItem('currentUser',username);
        loggedInUser=username;
        checkLogin();
    } else {
        message.textContent="Invalid username or password";
    }
});

// Logout
logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('currentUser');
    loggedInUser=null;
    loginBtn.classList.remove('hidden');
    signupBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    message.textContent="Logged out";
});

// Fake nav
function go(page){
    if(page==='home') window.location.href='home.html';
    if(page==='storage') alert('No recent activities stored yet!');
}
// Check if user is already logged in
let currentUser = localStorage.getItem('currentUser');
if(currentUser){
    // User is logged in — redirect to settings
    window.location.href = 'settings.html';
}

(function(){
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMessage');

  function show(text, color='') {
    if (msg) { msg.textContent = text; msg.style.color = color; }
  }

  function hideAuthButtons() {
    document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => {
      btn.classList.add('hidden');
    });
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

  function validateLocalUser(identifier, password) {
    const users = JSON.parse(localStorage.getItem('neonUsers') || '[]');
    const user = users.find(u => 
      (u.username === identifier || u.email === identifier) && u.password === password
    );
    return user || null;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!identifier || !password) {
      show('Please enter username/email and password', '#f00');
      return;
    }

    show('Logging in...', '#0ff');

    // try remote login first
    const remote = await loginRemote(identifier, password);
    if (remote && remote.token) {
      localStorage.setItem('authToken', remote.token);
      localStorage.setItem('currentUser', remote.user.username || identifier);
      hideAuthButtons();
      show('Login successful. Redirecting...', '#0f0');
      setTimeout(() => location.href = 'home.html', 900);
      return;
    }

    // fallback to local validation if network error
    if (remote && remote.error === 'network') {
      const localUser = validateLocalUser(identifier, password);
      if (localUser) {
        localStorage.setItem('currentUser', localUser.username);
        hideAuthButtons();
        show('Logged in locally (offline mode).', '#0f0');
        setTimeout(() => location.href = 'home.html', 900);
        return;
      } else {
        show('Invalid credentials (local)', '#f00');
        return;
      }
    }

    // backend returned an error
    show((remote && remote.error) ? remote.error : 'Login failed', '#f00');
  });

  // hide auth buttons on page load if already logged in
  if (localStorage.getItem('currentUser')) {
    hideAuthButtons();
  }
})();
