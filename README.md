# Sales Matrix Backend - Mailer Setup

This backend sends OTP emails for Sales Matrix. By default it supports multiple SMTP options:

- SendGrid SMTP (recommended for production)
- Generic SMTP (host/user/pass)
- Gmail with App Password (for testing)

If no mail settings are provided, the server will run but emails will be output as JSON (useful for local development).

## Environment variables
Create a `.env` file in the `backend/` folder with one of the following configurations.

### SendGrid (recommended)
```
SENDGRID_API_KEY=your_sendgrid_api_key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Generic SMTP
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Gmail (testing only)
- If your Gmail account uses 2-step verification, create an App Password and use it for `GMAIL_PASSWORD`.
```
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Install and run locally
Open PowerShell (run as Administrator if you need to change execution policy), then:

```powershell
cd 'C:\Users\frida\OneDrive\Documents\sales martix\backend'
npm install
npm start
```

## Testing
- Health check:
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/health
```

- Send test OTP:
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/send-otp -Method POST -ContentType 'application/json' -Body '{"email":"you@example.com"}'
```

If you use SendGrid, set `SENDGRID_API_KEY` in your hosting provider's environment variables and redeploy. For Netlify/Vercel/Render/Heroku, add the variable via their dashboard under environment variables/config vars.

## Notes
- SendGrid or another transactional provider is recommended for production for better deliverability and reliability.
- Do not commit `.env` to version control.
