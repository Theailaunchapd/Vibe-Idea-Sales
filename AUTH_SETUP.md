# Vib3 Idea Sales - Authentication System Setup Guide

This guide will help you set up the complete authentication system for Vib3 Idea Sales, including database configuration, email services, and Skool SSO (Phase 2).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running Migrations](#running-migrations)
5. [Email Configuration](#email-configuration)
6. [Testing the Auth System](#testing-the-auth-system)
7. [Skool SSO Setup (Phase 2)](#skool-sso-setup-phase-2)
8. [Security Best Practices](#security-best-practices)

## Prerequisites

- Node.js v18 or higher
- PostgreSQL 14 or higher
- SMTP email account (Gmail, SendGrid, etc.)
- npm or yarn package manager

## Database Setup

### 1. Install and Start PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Access PostgreSQL
psql postgres

# Create database
CREATE DATABASE vib3_idea_sales;

# Create user (optional, for production)
CREATE USER vib3_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vib3_idea_sales TO vib3_user;

# Exit psql
\q
```

### 3. Update Database Connection String

Your `.env` file should have:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/vib3_idea_sales
```

For local development:
```env
DATABASE_URL=postgresql://localhost:5432/vib3_idea_sales
```

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Configure Required Variables

Edit `.env` and update these critical values:

#### Database
```env
DATABASE_URL=postgresql://localhost:5432/vib3_idea_sales
```

#### JWT & Session Secrets (IMPORTANT: Change these!)
```bash
# Generate secure secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
JWT_SECRET=your_generated_secret_here
SESSION_SECRET=your_generated_secret_here
```

#### Email Configuration (Example: Gmail)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_specific_password
EMAIL_FROM=Vib3 Idea Sales <noreply@yourdomain.com>
```

**Note:** For Gmail, you need to:
1. Enable 2FA on your Google account
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASSWORD`

#### Application URLs
```env
APP_URL=http://localhost:5000
API_URL=http://localhost:3001
NODE_ENV=development
```

## Running Migrations

### 1. Generate Migration Files

```bash
npm run db:generate
```

This creates SQL migration files in `db/migrations/`

### 2. Apply Migrations

```bash
npm run db:migrate
```

This creates all necessary tables:
- `users` - User accounts
- `sessions` - Active user sessions
- `password_reset_tokens` - Password reset tokens
- `email_verification_tokens` - Email verification tokens
- `login_attempts` - Rate limiting data
- `crm_leads` - CRM lead management

### 3. Verify Tables

```bash
psql vib3_idea_sales -c "\dt"
```

You should see all 6 tables listed.

## Email Configuration

### Option 1: Gmail (Development)

1. Enable 2FA on your Google account
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

### Option 2: SendGrid (Production Recommended)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=Vib3 Idea Sales <noreply@yourdomain.com>
```

### Option 3: AWS SES (Production)

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_aws_access_key
SMTP_PASSWORD=your_aws_secret_key
```

## Testing the Auth System

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
npm run server
# Or: tsx server/index.ts
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 2. Test User Registration

1. Navigate to `http://localhost:5000`
2. Click "Launch Dashboard" → "Sign up"
3. Fill in the registration form
4. Check your email for verification link
5. Click verification link
6. You should be redirected to dashboard

### 3. Test Login

1. Go to login page
2. Enter email and password
3. Check "Remember me" (optional)
4. Click "Sign In"
5. Verify you're redirected to dashboard

### 4. Test Password Reset

1. Click "Forgot password?" on login page
2. Enter your email
3. Check email for reset link
4. Click link and enter new password
5. Login with new password

### 5. Test Session Management

1. Login and go to Account/Profile page
2. View active sessions
3. Revoke a session
4. Verify session is terminated

## Skool SSO Setup (Phase 2)

**Note:** This feature is marked as "Coming Soon" in the UI and requires Skool OAuth credentials.

### Prerequisites
- Skool Developer Account
- OAuth App registered with Skool

### Configuration

1. Register your app with Skool (contact Skool support)
2. Get your OAuth credentials
3. Update `.env`:

```env
SKOOL_CLIENT_ID=your_client_id
SKOOL_CLIENT_SECRET=your_client_secret
SKOOL_REDIRECT_URI=http://localhost:5000/auth/skool/callback
SKOOL_API_URL=https://www.skool.com/api
SKOOL_AUTHORIZE_URL=https://www.skool.com/oauth/authorize
SKOOL_TOKEN_URL=https://www.skool.com/oauth/token
```

### Implementation Status

✅ Database schema supports Skool SSO (`skoolId` field)
✅ Frontend UI prepared (button disabled)
⏳ OAuth flow implementation (pending Skool API docs)

To implement Skool SSO, you'll need to:
1. Create `/api/auth/skool/authorize` endpoint
2. Create `/api/auth/skool/callback` endpoint
3. Implement auto-login check for existing Skool sessions
4. Update login page to enable Skool button

## Security Best Practices

### Production Checklist

- [ ] Change all default secrets in `.env`
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific database
- [ ] Enable database SSL/TLS
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Password Requirements

The system enforces:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Rate Limiting

- Login attempts: Max 5 per 15 minutes
- API requests: Max 100 per 15 minutes (authenticated users exempt)
- Password reset: Max 5 per hour

### Session Security

- JWT expiration: 7 days (configurable)
- Refresh token: 30 days (configurable)
- HTTP-only cookies
- CSRF protection on state-changing operations
- Automatic token refresh

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Check connection
psql postgresql://localhost:5432/vib3_idea_sales -c "SELECT 1"
```

### Migration Errors

```bash
# Reset database (WARNING: Deletes all data)
npm run db:drop
npm run db:migrate

# Or manually:
psql vib3_idea_sales -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:migrate
```

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP server allows connections
3. Check server logs for error messages
4. Test with a different SMTP provider
5. Verify firewall/network allows outbound SMTP

### Common Errors

**Error:** "JWT_SECRET is not defined"
- **Fix:** Set `JWT_SECRET` in `.env`

**Error:** "Database connection failed"
- **Fix:** Verify PostgreSQL is running and `DATABASE_URL` is correct

**Error:** "Port 3001 already in use"
- **Fix:** Kill the process: `lsof -ti:3001 | xargs kill`

## Production Deployment

### Environment Variables

Set these on your hosting platform (Vercel, Railway, Render, etc.):

```env
# Required
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret

# Email
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=your_email_from

# Application
APP_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Database

Use a managed PostgreSQL service:
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Serverless, free tier)
- [Railway](https://railway.app) (PostgreSQL add-on)
- [Render](https://render.com) (PostgreSQL database)

### Email Service

Production-ready email services:
- [SendGrid](https://sendgrid.com) - 100 emails/day free
- [AWS SES](https://aws.amazon.com/ses/) - 62,000 emails/month free
- [Mailgun](https://www.mailgun.com) - 5,000 emails/month free
- [Postmark](https://postmarkapp.com) - Pay as you go

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Check GitHub issues
4. Contact development team

## License

© 2024 Vib3 Idea Sales. All rights reserved.
