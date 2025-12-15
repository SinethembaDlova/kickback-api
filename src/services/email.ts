import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendPasswordResetEmail = async (
  email: string,
  code: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"KickBack" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your KickBack Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .code { font-size: 32px; font-weight: bold; text-align: center; 
                    background: white; padding: 20px; margin: 20px 0; 
                    letter-spacing: 5px; color: #2563eb; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>You recently requested to reset your password for your KickBack account.</p>
              <p>Use the verification code below to reset your password:</p>
              <div class="code">${code}</div>
              <p><strong>This code expires in 15 minutes.</strong></p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} KickBack. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"KickBack" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to KickBack!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; 
                      color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to KickBack!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Welcome to KickBack - your premium sneaker cleaning service!</p>
              <p>We're excited to help keep your sneakers looking fresh. Here's what you can do:</p>
              <ul>
                <li>Book cleaning services with just a few clicks</li>
                <li>Track your orders in real-time</li>
                <li>Choose from Bronze, Silver, or Gold service tiers</li>
                <li>Schedule convenient pickup and delivery times</li>
              </ul>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} KickBack. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - welcome email failure shouldn't block signup
  }
};