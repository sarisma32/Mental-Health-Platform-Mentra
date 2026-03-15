# Email Service Setup Guide

## Current Implementation
The current implementation uses a **mock email service** that logs OTPs to the console. For production, you need to integrate with a real email service.

## Recommended Email Services

### 1. SendGrid (Recommended)
```bash
npm install @sendgrid/mail
```

**Setup:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Add to your `.env` file:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
```

**Update `backend/utils/emailService.js`:**
```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPEmail = async (email, otp, userName = '') => {
  try {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Password Reset OTP - Mentra',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${userName || 'User'},</p>
          <p>Your password reset OTP is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Mentra Team</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, message: 'Failed to send OTP email' };
  }
};
```

### 2. Nodemailer with Gmail
```bash
npm install nodemailer
```

**Setup:**
1. Enable 2-factor authentication on Gmail
2. Generate an app password
3. Add to your `.env` file:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
FROM_EMAIL=your-email@gmail.com
```

**Update `backend/utils/emailService.js`:**
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const sendOTPEmail = async (email, otp, userName = '') => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Password Reset OTP - Mentra',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${userName || 'User'},</p>
          <p>Your password reset OTP is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Mentra Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Nodemailer error:', error);
    return { success: false, message: 'Failed to send OTP email' };
  }
};
```

### 3. AWS SES
```bash
npm install @aws-sdk/client-ses
```

**Setup:**
1. Configure AWS credentials
2. Verify your domain/email in SES
3. Add to your `.env` file:
```env
AWS_REGION=us-east-1
FROM_EMAIL=noreply@yourdomain.com
```

### 4. Mailgun
```bash
npm install mailgun-js
```

## Environment Variables
Add these to your `backend/.env` file:

```env
# Email Service Configuration
EMAIL_SERVICE=sendgrid  # or 'nodemailer', 'ses', 'mailgun'
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# For Gmail with Nodemailer
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# For production
NODE_ENV=production
```

## Testing Email Service

Create a test script to verify email sending:

```javascript
// test-email.js
import { sendOTPEmail } from './utils/emailService.js';

const testEmail = async () => {
  const result = await sendOTPEmail('test@example.com', '123456', 'Test User');
  console.log('Email test result:', result);
};

testEmail();
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting for OTP requests
2. **Email Validation**: Validate email addresses before sending
3. **Monitoring**: Monitor email delivery rates and failures
4. **Fallback**: Have a backup email service in case primary fails
5. **Templates**: Use professional email templates
6. **Unsubscribe**: Include unsubscribe links for marketing emails

## Production Checklist

- [ ] Choose and configure email service
- [ ] Update environment variables
- [ ] Test email delivery
- [ ] Set up email templates
- [ ] Configure rate limiting
- [ ] Monitor email metrics
- [ ] Set up email authentication (SPF, DKIM, DMARC)
- [ ] Test with real email addresses
- [ ] Configure error handling and logging