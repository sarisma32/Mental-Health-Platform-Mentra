# Email Setup Guide for Mentra

This guide will help you set up real email sending for OTP (forgot password) functionality.

## Option 1: Gmail SMTP (Recommended for Development)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", enable "2-Step Verification"
4. Follow the prompts to set it up

### Step 2: Generate App Password
1. After enabling 2FA, go back to Security settings
2. Under "Signing in to Google", click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Name it "Mentra Backend" or similar
5. Click "Generate"
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Open `backend/.env` and update these lines:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Important:** 
- Use your actual Gmail address for `EMAIL_USER`
- Use the 16-character app password (with or without spaces) for `EMAIL_PASSWORD`
- Do NOT use your regular Gmail password

### Step 4: Restart Backend Server
```bash
cd backend
npm start
```

### Step 5: Test It!
1. Go to the forgot password page
2. Enter an email address
3. Check that email's inbox for the OTP
4. The OTP should arrive within seconds!

---

## Option 2: Other Email Services

### SendGrid (Production Recommended)
1. Sign up at https://sendgrid.com/
2. Get your API key
3. Install: `npm install @sendgrid/mail`
4. Update emailService.js to use SendGrid

### Mailgun
1. Sign up at https://www.mailgun.com/
2. Get your API key and domain
3. Install: `npm install mailgun-js`
4. Update emailService.js to use Mailgun

### AWS SES
1. Set up AWS SES in your AWS account
2. Verify your domain/email
3. Install: `npm install aws-sdk`
4. Update emailService.js to use AWS SES

---

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password, not your regular Gmail password
- Ensure 2-Factor Authentication is enabled on your Gmail account

### "Less secure app access" error
- Gmail no longer supports "less secure apps"
- You MUST use App Passwords (requires 2FA)

### Emails not arriving
- Check spam/junk folder
- Verify EMAIL_USER is correct in .env
- Check backend console for error messages
- Make sure backend server was restarted after updating .env

### Rate limiting
- Gmail has sending limits (500 emails/day for free accounts)
- For production, use SendGrid, Mailgun, or AWS SES

---

## Security Best Practices

1. **Never commit .env file to Git**
   - It's already in .gitignore
   - Never share your app password

2. **Use environment variables**
   - Always use process.env for sensitive data
   - Never hardcode credentials

3. **For Production**
   - Use a professional email service (SendGrid, Mailgun, AWS SES)
   - Set up SPF, DKIM, and DMARC records
   - Use a custom domain email

---

## Current Email Template Features

✅ Professional HTML email design
✅ Mentra branding with sage green colors
✅ Large, easy-to-read OTP display
✅ Security warnings
✅ 10-minute expiration notice
✅ Responsive design
✅ Confirmation emails after password reset

---

## Need Help?

If you encounter issues:
1. Check the backend console for error messages
2. Verify your .env configuration
3. Ensure your Gmail account has 2FA enabled
4. Try generating a new App Password

For production deployment, consider using a dedicated email service provider for better deliverability and analytics.
