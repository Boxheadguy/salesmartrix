// OTP Verification Page Logic

// Get email from sessionStorage (passed from signup)
let userEmail = sessionStorage.getItem('signupEmail');

if (!userEmail) {
    window.location.href = 'signup.html';
}

// DOM Elements
const emailDisplay = document.getElementById('emailDisplay');
const otpInput = document.getElementById('otpInput');
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const message = document.getElementById('otpMessage2');

// Get email from session storage
const email = sessionStorage.getItem('signupEmail');
const username = sessionStorage.getItem('signupUsername');
const password = sessionStorage.getItem('signupPassword');

// Show intro
setTimeout(() => {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('otp-page').classList.remove('hidden');
}, 2500);

if (!email) {
    alert('Invalid session. Redirecting to signup...');
    window.location.href = 'signup.html';
}

// Initialize
emailDisplay.textContent = `Verification code sent to ${userEmail}`;

// Timer countdown
function startTimer() {
    let timeLeft = 600; // 10 minutes
    
    const interval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            otpTimer.textContent = '';
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            otpTimer.textContent = `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 120) {
                otpTimer.style.color = '#e74c3c';
            }
        }
    }, 1000);
}

startTimer();

// Only allow numeric input
otpInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    
    // Auto-submit if 6 digits entered
    if (e.target.value.length === 6) {
        verifyOTPCode();
    }
});

// Verify OTP
verifyBtn.addEventListener('click', async () => {
    const inputOtp = otpInput.value.trim();
    
    if (!inputOtp || inputOtp.length !== 6) {
        message.textContent = 'Please enter a valid 6-digit OTP';
        message.style.color = '#f00';
        return;
    }
    
    const result = OTP.verify(email, inputOtp);
    
    if (result.valid) {
        message.textContent = '✓ OTP verified! Creating your account...';
        message.style.color = '#0f0';
        
        // Create account
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('neonUsers')) || [];
            const newUser = {
                id: Date.now(),
                username,
                email,
                password,
                createdAt: new Date().toLocaleString()
            };
            users.push(newUser);
            localStorage.setItem('neonUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', username);
            
            // Clear session
            sessionStorage.removeItem('signupEmail');
            sessionStorage.removeItem('signupUsername');
            sessionStorage.removeItem('signupPassword');
            
            alert('Account created successfully!');
            window.location.href = 'home.html';
        }, 1500);
    } else {
        message.textContent = result.message;
        message.style.color = '#f00';
    }
});

// Resend OTP
resendBtn.addEventListener('click', async () => {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    
    await OTP.send(email);
    
    message.textContent = '✓ New OTP sent to your email!';
    message.style.color = '#0f0';
    
    setTimeout(() => {
        resendBtn.disabled = false;
        resendBtn.textContent = '🔄 Resend OTP';
        message.textContent = '';
    }, 3000);
});

function showMessage(message, type) {
    otpMessage.textContent = message;
    otpMessage.className = 'message ' + type;
}

// Create background bars animation
function createBars() {
    const barsContainer = document.getElementById('bars-container');
    for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        barsContainer.appendChild(bar);
    }
}

createBars();
