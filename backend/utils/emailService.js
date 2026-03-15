import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName = '') => {
  try {
    console.log('📧 Attempting to send OTP email...');
    console.log('To:', email);
    console.log('OTP:', otp);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
    
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - Mentra',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #A3B18A;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .otp-box {
              background-color: #f0f0f0;
              border: 2px dashed #A3B18A;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
              color: #A3B18A;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'User'},</p>
              
              <p>We received a request to reset your password for your Mentra account.</p>
              
              <p>Your One-Time Password (OTP) is:</p>
              
              <div class="otp-box">
                ${otp}
              </div>
              
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
              </div>
              
              <p>For your security, never share this OTP with anyone, including Mentra staff.</p>
              
              <p>Best regards,<br>
              <strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP Email sent successfully to:', email);
    console.log('Message ID:', info.messageId);

    return { success: true, message: 'OTP sent successfully to your email' };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    
    // Fallback: Show in console if email fails
    console.log(`
    ===============================
    📧 OTP EMAIL (FALLBACK - Email service failed)
    ===============================
    To: ${email}
    OTP: ${otp}
    ===============================
    `);
    
    return { success: false, message: 'Failed to send OTP email. Please try again.' };
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, userName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Successful - Mentra',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #A3B18A;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .success-icon {
              text-align: center;
              font-size: 48px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              
              <p>Hi ${userName || 'User'},</p>
              
              <p>Your password has been successfully reset for your Mentra account.</p>
              
              <p>You can now log in with your new password.</p>
              
              <div class="warning">
                <strong>⚠️ Security Alert:</strong> If you didn't make this change, please contact our support team immediately at support@mentra.com
              </div>
              
              <p>Thank you for using Mentra!</p>
              
              <p>Best regards,<br>
              <strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset confirmation email sent to:', email);
    console.log('Message ID:', info.messageId);

    return { success: true, message: 'Confirmation email sent' };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return { success: false, message: 'Failed to send confirmation email' };
  }
};