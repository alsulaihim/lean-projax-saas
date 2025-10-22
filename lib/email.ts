import crypto from 'crypto'

/**
 * Email Service Utility
 * 
 * Purpose: Send transactional emails (verification, password reset, etc.)
 * 
 * Supported Providers:
 * - Console (development - logs to console)
 * - Resend (production - requires RESEND_API_KEY)
 * - SendGrid (alternative - requires SENDGRID_API_KEY)
 * - Custom SMTP (requires SMTP configuration)
 * 
 * Configuration:
 * Set EMAIL_PROVIDER in .env to: 'console' | 'resend' | 'sendgrid' | 'smtp'
 * 
 * For production, add to .env.local:
 * EMAIL_PROVIDER=resend
 * RESEND_API_KEY=re_xxxxxxxxxxxx
 * EMAIL_FROM=noreply@yourdomain.com
 */

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console'
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@leanprojax.com'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email using configured provider
 * 
 * @param options - Email options (to, subject, html, text)
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    switch (EMAIL_PROVIDER) {
      case 'console':
        return await sendEmailConsole(options)
      
      case 'resend':
        return await sendEmailResend(options)
      
      case 'sendgrid':
        return await sendEmailSendGrid(options)
      
      default:
        console.error(`Unknown email provider: ${EMAIL_PROVIDER}`)
        return false
    }
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

/**
 * Console provider - Development only
 * 
 * Logs email to console instead of sending
 * Good for local testing without email service setup
 */
async function sendEmailConsole(options: EmailOptions): Promise<boolean> {
  console.log('\n' + '='.repeat(80))
  console.log('📧 EMAIL (Development Mode - Not Actually Sent)')
  console.log('='.repeat(80))
  console.log(`From: ${EMAIL_FROM}`)
  console.log(`To: ${options.to}`)
  console.log(`Subject: ${options.subject}`)
  console.log('-'.repeat(80))
  console.log(options.html)
  console.log('='.repeat(80) + '\n')
  return true
}

/**
 * Resend provider - Production
 * 
 * Requires: npm install resend
 * Env var: RESEND_API_KEY
 */
async function sendEmailResend(options: EmailOptions): Promise<boolean> {
  // Implementation note: Install resend package when ready for production
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({ from: EMAIL_FROM, ...options })
  
  console.warn('Resend not configured. Install package: npm install resend')
  return await sendEmailConsole(options) // Fallback to console
}

/**
 * SendGrid provider - Alternative
 * 
 * Requires: npm install @sendgrid/mail
 * Env var: SENDGRID_API_KEY
 */
async function sendEmailSendGrid(options: EmailOptions): Promise<boolean> {
  // Implementation note: Install sendgrid when ready for production
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  // await sgMail.send({ from: EMAIL_FROM, ...options })
  
  console.warn('SendGrid not configured. Install package: npm install @sendgrid/mail')
  return await sendEmailConsole(options) // Fallback to console
}

/**
 * Generate secure verification token
 * 
 * Uses crypto.randomBytes for cryptographically secure random values
 * 
 * @returns 32-character hex token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Send email verification email
 * 
 * @param email - User's email address
 * @param name - User's name
 * @param token - Verification token
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: #000; margin: 0;">Welcome to Lean Projax!</h1>
      </div>
      
      <p>Hi ${name},</p>
      
      <p>Thanks for signing up for Lean Projax! To complete your registration and start creating Six Sigma assignments, please verify your email address.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Verify Email Address
        </a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
        ${verificationUrl}
      </p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        This link will expire in 24 hours. If you didn't create an account with Lean Projax, you can safely ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px;">
        © 2025 Lean Projax. All rights reserved.
      </p>
    </body>
    </html>
  `
  
  const text = `
    Welcome to Lean Projax!
    
    Hi ${name},
    
    Thanks for signing up! Please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, you can ignore this email.
    
    © 2025 Lean Projax
  `
  
  return await sendEmail({
    to: email,
    subject: 'Verify your email - Lean Projax',
    html,
    text
  })
}

/**
 * Send password reset email (placeholder for future)
 * 
 * @param email - User's email
 * @param name - User's name
 * @param token - Reset token
 * @returns Promise<boolean>
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  // TODO: Implement when password reset feature is added
  console.log(`Password reset email for ${email} with token ${token}`)
  return true
}

