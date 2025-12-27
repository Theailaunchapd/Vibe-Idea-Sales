import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Vib3 Idea Sales <noreply@vib3ideasales.com>';
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

let transporter: Transporter | null = null;

// Initialize email transporter
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
      }
    });
  }
  return transporter;
}

// Email templates
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000000 0%, #1f2937 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #374151; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>We received a request to reset your password for your Vib3 Idea Sales account. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </div>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>© 2024 Vib3 Idea Sales. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Reset Your Password

    We received a request to reset your password for your Vib3 Idea Sales account.

    Click the link below to create a new password (expires in 1 hour):
    ${resetUrl}

    If you didn't request a password reset, you can safely ignore this email.

    © 2024 Vib3 Idea Sales
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Vib3 Idea Sales Password',
    html,
    text
  });
}

// Send email verification email
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000000 0%, #1f2937 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #374151; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Vib3 Idea Sales!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Thank you for signing up! Please verify your email address to get started with Vib3 Idea Sales and unlock all features:</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verifyUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>© 2024 Vib3 Idea Sales. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to Vib3 Idea Sales!

    Thank you for signing up! Please verify your email address by clicking the link below:
    ${verifyUrl}

    This link will expire in 24 hours.

    © 2024 Vib3 Idea Sales
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Vib3 Idea Sales Email',
    html,
    text
  });
}

// Send welcome email after verification
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000000 0%, #1f2937 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .feature { padding: 15px; margin: 10px 0; background: #f9fafb; border-left: 3px solid #000000; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're All Set!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your email has been verified! Welcome to Vib3 Idea Sales - the all-in-one intelligence platform that turns market chaos into profitable AI agencies.</p>

          <h3>What you can do now:</h3>
          <div class="feature">
            <strong>🔍 Scout Job Boards</strong><br>
            Find AI automation opportunities in job listings
          </div>
          <div class="feature">
            <strong>🏢 Discover Struggling Businesses</strong><br>
            Identify businesses that need your services
          </div>
          <div class="feature">
            <strong>💡 Mine Reddit & Social Media</strong><br>
            Find trending problems to solve
          </div>
          <div class="feature">
            <strong>🤖 AI-Powered Analysis</strong><br>
            Get pitch templates, workflows, and implementation plans
          </div>

          <p style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Launch Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2024 Vib3 Idea Sales. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    You're All Set!

    Hi ${name},

    Your email has been verified! Welcome to Vib3 Idea Sales.

    Get started: ${dashboardUrl}

    © 2024 Vib3 Idea Sales
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Vib3 Idea Sales!',
    html,
    text
  });
}
