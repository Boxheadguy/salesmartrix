/* Lightweight Firebase Realtime Database helper + backend fallbacks.
   Usage:
     - Set window.FIREBASE_CONFIG or environment variables
     - Calls window.firebaseHelpers.init() auto-runs on load
*/
(function () {
  let inited = false;
  let db = null;

  function safeInit(cfg) {
    try {
      // allow config from param, window, or environment
      const config = cfg || window.FIREBASE_CONFIG || {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        databaseURL: process.env.FIREBASE_DATABASE_URL || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
      };
      
      if (!config.apiKey || !config.databaseURL) {
        console.warn('Firebase config incomplete');
        return false;
      }
      
      if (!window.firebase || !window.firebase.database) {
        console.warn('Firebase SDK not loaded');
        return false;
      }
      
      if (!inited) {
        window.firebase.initializeApp(config);
        db = window.firebase.database();
        inited = true;
        console.log('✅ Firebase initialized');
      }
      return true;
    } catch (e) {
      console.error('Firebase init error', e);
      return false;
    }
  }

  async function fetchProducts() {
    if (!inited || !db) return null;
    try {
      const snap = await db.ref('products').once('value');
      const val = snap.val() || {};
      // return array
      return Object.keys(val).map(k => ({ id: Number(k) || k, ...val[k] }));
    } catch (e) {
      console.error('fetchProducts error', e);
      return null;
    }
  }

  async function saveProduct(p) {
    if (!inited || !db) return false;
    try {
      const key = p.id || Date.now();
      await db.ref('products/' + key).set(p);
      return true;
    } catch (e) {
      console.error('saveProduct error', e);
      return false;
    }
  }

  async function fetchUsers() {
    if (!inited || !db) return null;
    try {
      const snap = await db.ref('users').once('value');
      const val = snap.val() || {};
      return Object.keys(val).map(k => val[k]);
    } catch (e) {
      console.error('fetchUsers error', e);
      return null;
    }
  }

  async function saveUser(u) {
    if (!inited || !db) return false;
    if (!u || !u.username) return false;
    try {
      const key = encodeURIComponent(u.username);
      await db.ref('users/' + key).update(u);
      return true;
    } catch (e) {
      console.error('saveUser error', e);
      return false;
    }
  }

  async function setPresence(username) {
    if (!inited || !db || !username) return;
    try {
      const key = encodeURIComponent(username);
      await db.ref('presence/' + key).set({ lastSeen: Date.now() });
    } catch (e) {
      console.error('setPresence error', e);
    }
  }

  // simple backend fallbacks (existing express backend)
  async function registerViaApi({ username, email, password }) {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      return await res.json();
    } catch (e) {
      return { error: 'network' };
    }
  }

  async function loginViaApi({ identifier, password }) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      return await res.json();
    } catch (e) {
      return { error: 'network' };
    }
  }

  window.firebaseHelpers = {
    init(cfg) { return safeInit(cfg); },
    fetchProducts,
    saveProduct,
    fetchUsers,
    saveUser,
    setPresence,
    registerViaApi,
    loginViaApi
  };

  window.addEventListener('load', () => {
    // auto-init if config present
    setTimeout(() => {
      if (window.FIREBASE_CONFIG || (process.env && process.env.FIREBASE_API_KEY)) {
        safeInit();
      }
    }, 100);
  });
})();
