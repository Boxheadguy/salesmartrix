// Lightweight AI chat agent with safe fallback

(function(){
    const TOGGLE = document.getElementById('ai-toggle');
    const PANEL  = document.getElementById('ai-panel');
    const CLOSE  = document.getElementById('ai-close');
    const FORM   = document.getElementById('ai-form');
    const INPUT  = document.getElementById('ai-input');
    const MSGS   = document.getElementById('ai-messages');

    const STORAGE_KEY = 'aiChatHistory_v1';
    const API_URL = window.AI_API_URL || '/api/ai'; // Optional server endpoint

    function loadHistory(){
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if(!raw) return [];
            return JSON.parse(raw);
        } catch { return []; }
    }

    function saveHistory(history){
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch {}
    }

    function renderHistory(){
        if(!MSGS) return;
        MSGS.innerHTML = '';
        const history = loadHistory();
        history.forEach(item => appendMessage(item.role, item.text, false));
        MSGS.scrollTop = MSGS.scrollHeight;
    }

    function appendMessage(role, text, persist = true){
        if(!MSGS) return;
        const div = document.createElement('div');
        div.className = 'ai-msg ' + (role === 'user' ? 'user' : 'assistant');
        div.textContent = text;
        MSGS.appendChild(div);
        MSGS.scrollTop = MSGS.scrollHeight;
        if(persist){
            const history = loadHistory();
            history.push({ role, text, time: Date.now() });
            saveHistory(history);
        }
    }

    function setTyping(on){
        if(!MSGS) return;
        if(on){
            const el = document.createElement('div');
            el.className = 'ai-msg assistant';
            el.id = 'ai-typing';
            el.textContent = 'Typing…';
            MSGS.appendChild(el);
            MSGS.scrollTop = MSGS.scrollHeight;
        } else {
            const t = document.getElementById('ai-typing');
            if(t) t.remove();
        }
    }

    async function queryAI(message){
        // Try external API if available
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message })
            });
            if(!res.ok) throw new Error('No remote AI');
            const data = await res.json();
            // Accept plain { reply: "..." } or { answer: "..." }
            return data.reply || data.answer || data.text || JSON.stringify(data);
        } catch (err) {
            // fallback to local responder
            return localFallback(message);
        }
    }

    function localFallback(message){
        const m = (message || '').toLowerCase();
        if(!m) return "Please type a question.";
        // Simple keyword rules
        if(/\b(hello|hi|hey)\b/.test(m)) return "Hello! I'm the Sales Matrix assistant. Ask me about products, orders or support.";
        if(/\b(order|status|tracking)\b/.test(m)) return "To check order status go to Orders. If you share an order number I can give basic guidance.";
        if(/\b(cart|checkout|buy|add to cart)\b/.test(m)) return "You can add items to your cart from the product list. Open the Cart button in the header to view or checkout.";
        if(/\b(price|cost|how much)\b/.test(m)) return "Product prices are shown on each product card. Use the search to find items and compare.";
        if(/\b(return|refund)\b/.test(m)) return "For returns/refunds, please visit the Orders page and open the order details, or contact support@salesmatrix.com.";
        if(/\b(help|support|contact)\b/.test(m)) return "You can contact support at support@salesmatrix.com or call 1-800-NEON. What do you need help with specifically?";
        // fallback generic
        return "Sorry, I don't have that info locally. Try asking about products, orders, account or contact support.";
    }

    async function sendMessage(message){
        if(!message || !message.trim()) return;
        appendMessage('user', message);
        if(INPUT) INPUT.value = '';
        setTyping(true);
        const reply = await queryAI(message);
        setTyping(false);
        appendMessage('assistant', reply);
    }

    // UI events
    TOGGLE?.addEventListener('click', () => {
        const open = !PANEL.classList.contains('hidden');
        if(open){
            PANEL.classList.add('hidden');
            TOGGLE.setAttribute('aria-expanded','false');
        } else {
            PANEL.classList.remove('hidden');
            TOGGLE.setAttribute('aria-expanded','true');
            renderHistory();
            INPUT?.focus();
        }
    });

    CLOSE?.addEventListener('click', () => {
        PANEL.classList.add('hidden');
        TOGGLE.setAttribute('aria-expanded','false');
    });

    FORM?.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(INPUT.value);
    });

    INPUT?.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') { PANEL.classList.add('hidden'); TOGGLE.setAttribute('aria-expanded','false'); }
    });

    // initialize if panel exists
    if(PANEL) renderHistory();

    // expose for debugging
    window.aiAgent = { sendMessage, queryAI, clearHistory: () => { localStorage.removeItem(STORAGE_KEY); MSGS && (MSGS.innerHTML=''); } };
})();
