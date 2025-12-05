// Community chat with offline message support

Core.onReady(() => {
  const currentUser = Core.getCurrentUser();
  const intro = document.getElementById('intro');
  const app = document.getElementById('chat-app');

  // Hide auth buttons if logged in
  if (currentUser) {
    document.querySelectorAll('button[onclick*="login"], button[onclick*="signup"]').forEach(btn => {
      btn.classList.add('hidden');
    });
  }

  // elements
  const allUsersList = document.getElementById('allUsersList');
  const savedList = document.getElementById('savedList');
  const searchInput = document.getElementById('explorer-search');
  const messagesEl = document.getElementById('messages');
  const chatName = document.getElementById('chatName');
  const chatStatus = document.getElementById('chatStatus');
  const chatAvatar = document.getElementById('chatAvatar');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const refreshBtn = document.getElementById('refreshPresence');

  let selectedUser = null;
  const chatKey = (a, b) => {
    const names = [a, b].sort();
    return `chat_${names[0]}_${names[1]}`;
  };

  // Hide intro
  setTimeout(() => {
    if (intro) intro.style.display = 'none';
    if (app) app.classList.remove('hidden');
  }, 700);

  if (!currentUser) {
    Core.notify('Please login to chat', 'error');
    sendBtn.disabled = true;
    messageInput.disabled = true;
    return;
  }

  // User item
  function mkUserItem(user) {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.dataset.username = user.username;
    const online = Core.isOnline(user.username);
    div.innerHTML = `
      <div class="avatar">${Core.escape(user.username[0]).toUpperCase()}</div>
      <div style="flex:1">
        <div style="color:#0ff;font-weight:700">${Core.escape(user.username)}</div>
        <div style="font-size:0.85rem;color:#aaa">${Core.escape(user.email || '')}</div>
      </div>
      <div class="presence-dot ${online ? 'presence-online' : 'presence-offline'}"></div>
      <button class="save-btn" style="background:0;border:0;color:#0ff;cursor:pointer;font-size:1.1rem;">☆</button>
    `;
    
    div.querySelector('.user-item, .avatar, div:not(.presence-dot):not(.save-btn)').addEventListener('click', () => selectUser(user.username));
    div.addEventListener('click', (e) => {
      if (e.target.closest('.user-item:not(.save-btn)')) selectUser(user.username);
    });
    div.querySelector('.save-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSaved(user.username, div.querySelector('.save-btn'));
    });
    
    return div;
  }

  function renderUsers(filter = '') {
    const users = Core.getUsers().filter(u => u.username);
    allUsersList.innerHTML = '';
    users.filter(u => u.username.toLowerCase().includes(filter.toLowerCase()))
         .forEach(u => allUsersList.appendChild(mkUserItem(u)));
    renderSaved();
  }

  function renderSaved() {
    const saved = Core.getLS('savedContacts', []);
    const users = Core.getUsers();
    savedList.innerHTML = '';
    saved.forEach(name => {
      const u = users.find(x => x.username === name);
      if (!u) return;
      const el = mkUserItem(u);
      el.querySelector('.save-btn').textContent = '★';
      savedList.appendChild(el);
    });
  }

  function toggleSaved(username, btn) {
    const saved = Core.getLS('savedContacts', []);
    const idx = saved.indexOf(username);
    if (idx === -1) {
      saved.push(username);
      btn && (btn.textContent = '★');
    } else {
      saved.splice(idx, 1);
      btn && (btn.textContent = '☆');
    }
    Core.setLS('savedContacts', saved);
    renderSaved();
  }

  function selectUser(username) {
    selectedUser = username;
    chatName.textContent = username;
    chatAvatar.textContent = username[0].toUpperCase();
    chatStatus.textContent = Core.isOnline(username) ? 'online' : 'offline';
    const saved = Core.getLS('savedContacts', []);
    saveContactBtn.textContent = saved.includes(username) ? '★' : '☆';
    saveContactBtn.classList.remove('hidden');
    renderMessages();
    messageInput.focus();
  }

  function renderMessages() {
    messagesEl.innerHTML = '';
    if (!selectedUser) return;
    const key = chatKey(currentUser, selectedUser);
    const msgs = Core.getLS(key, []);
    msgs.forEach(m => {
      const div = document.createElement('div');
      div.className = 'msg ' + (m.sender === currentUser ? 'me' : 'them');
      const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      div.innerHTML = `<div>${Core.escape(m.text)}</div><span class="meta">${time}</span>`;
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function sendMessage(text) {
    if (!text.trim()) {
      messageInput.focus();
      return;
    }
    if (!selectedUser) {
      Core.notify('Select a user first', 'error');
      return;
    }
    
    const key = chatKey(currentUser, selectedUser);
    const msgs = Core.getLS(key, []);
    msgs.push({
      sender: currentUser,
      text: text.trim(),
      time: Date.now()
    });
    Core.setLS(key, msgs);
    renderMessages();
    messageInput.value = '';
    messageInput.focus();
  }

  // Event listeners
  if (messageForm) {
    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(messageInput.value);
    });
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput.value);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderUsers(e.target.value));
  }

  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', () => {
      if (selectedUser) toggleSaved(selectedUser, saveContactBtn);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', renderUsers);
  }

  // Init
  Core.updatePresence(currentUser);
  setInterval(() => Core.updatePresence(currentUser), 30000);
  renderUsers();
});

window.addEventListener('load', Core.createBars);
