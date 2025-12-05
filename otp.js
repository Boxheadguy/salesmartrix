// OTP Module for Gmail Verification (Client-side with Backend API)
// This module handles OTP generation, storage, and verification for new users

// API endpoint (change this to your backend URL when hosting)
const API_URL = 'http://localhost:5000/api';

// ====== OTP MANAGEMENT ======

const OTP = {
    // Generate a unique 6-digit OTP
    generate() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    
    // Store OTP temporarily (expires in 10 minutes)
    store(email, otp) {
        const otpData = {
            email,
            code: otp,
            timestamp: Date.now(),
            expiresIn: 10 * 60 * 1000 // 10 minutes
        };
        localStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
    },
    
    // Retrieve and validate OTP
    verify(email, inputCode) {
        const otpData = JSON.parse(localStorage.getItem(`otp_${email}`));
        
        if (!otpData) {
            return { valid: false, message: 'OTP not found. Please request a new code.' };
        }
        
        const now = Date.now();
        const isExpired = now - otpData.timestamp > otpData.expiresIn;
        
        if (isExpired) {
            localStorage.removeItem(`otp_${email}`);
            return { valid: false, message: 'OTP expired. Please request a new code.' };
        }
        
        if (otpData.code !== inputCode) {
            return { valid: false, message: 'Invalid OTP. Please try again.' };
        }
        
        // OTP is valid, remove it
        localStorage.removeItem(`otp_${email}`);
        return { valid: true, message: 'OTP verified successfully!' };
    },
    
    // Send OTP (console log for local, backend email for production)
    async send(email) {
        const otp = this.generate();
        this.store(email, otp);
        
        // Log to console (for development)
        console.log(`📧 OTP for ${email}: ${otp}`);
        
        // In production with Netlify, call a serverless function
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            try {
                const response = await fetch('/.netlify/functions/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });
                const data = await response.json();
                return data.success ? otp : null;
            } catch (error) {
                console.error('Error sending OTP:', error);
                // Fallback to console
                return otp;
            }
        }
        
        return otp;
    },
    
    // Count how many accounts use the same email
    countEmailAccounts(email) {
        const users = JSON.parse(localStorage.getItem('neonUsers')) || [];
        return users.filter(u => u.email === email).length;
    }
};

// Send OTP via backend API
async function sendOTPToEmail(email) {
    try {
        const response = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: 'Failed to send OTP. Make sure backend is running.' };
    }
}

// Verify OTP via backend API
async function verifyOTPWithBackend(email, otp) {
    try {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, message: 'Failed to verify OTP. Make sure backend is running.' };
    }
}

// Resend OTP via backend API
async function resendOTPWithBackend(email) {
    try {
        const response = await fetch(`${API_URL}/resend-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error resending OTP:', error);
        return { success: false, message: 'Failed to resend OTP.' };
    }
}

// Get remaining time for OTP expiration (in seconds)
function getOTPTimeRemaining(email) {
    const otpData = JSON.parse(localStorage.getItem(`otp_${email}`));
    
    if (!otpData) return 0;
    
    const elapsed = Date.now() - otpData.timestamp;
    const remaining = otpData.expiresIn - elapsed;
    
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
