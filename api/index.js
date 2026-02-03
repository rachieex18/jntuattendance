const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();

// Root route for health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'JNTU Attendance API is running' });
});

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(cors());

// ============================================
// 📧 EMAIL CONFIGURATION
// ============================================
const EMAIL_CONFIG = {
    senderEmail: process.env.SENDER_EMAIL || 'reyentraeegola@gmail.com',
    senderPassword: process.env.SENDER_PASSWORD || 'ioqtfpkbqbetbreb',
};

// Supabase Init (Admin)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || 'https://npxxtdymrjykixszxchd.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHh0ZHltcmp5a2l4c3p4Y2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDcwMjcsImV4cCI6MjA4NTI4MzAyN30.R5dgdmXFZBqwWUun8wvXg06lU_Ezxv2oye00qhg9TTY'
);

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_CONFIG.senderEmail,
        pass: EMAIL_CONFIG.senderPassword,
    },
});

// ============================================
// 📊 TEMPORARY STORAGE
// Note: In serverless, use external storage like Redis/Upstash
// For now using in-memory (will reset on cold starts)
// ============================================
const pendingUsers = new Map();
const verificationCodes = new Map();

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: EMAIL_CONFIG.senderEmail,
        to: email,
        subject: '🔐 Your Verification Code',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome! 🎉</h2>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 5px; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes.
          </p>
          <p style="color: #999; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}

async function sendVerificationLinkEmail(email, token, baseUrl) {
    const verificationLink = `${baseUrl}/api/verify-email?token=${token}`;

    const mailOptions = {
        from: EMAIL_CONFIG.senderEmail,
        to: email,
        subject: '✅ Verify Your Email Address',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Almost There! 🚀</h2>
          <p style="color: #666; font-size: 16px;">
            Click the button below to verify your email address:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #28a745; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #007bff; font-size: 14px; word-break: break-all;">
            ${verificationLink}
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This link will expire in 10 minutes.
          </p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}

async function sendResetOTPEmail(email, otp) {
    const mailOptions = {
        from: EMAIL_CONFIG.senderEmail,
        to: email,
        subject: '🔒 Reset Your Password',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset 🔑</h2>
          <p style="color: #666; font-size: 16px;">You requested a password reset. Your 6-digit code is:</p>
          <div style="background-color: #dc3545; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 5px; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes.
          </p>
          <p style="color: #999; font-size: 14px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
    };
    await transporter.sendMail(mailOptions);
}

async function finalizeUserCreation(email) {
    const userData = pendingUsers.get(email);
    if (!userData) throw new Error('User data not found');

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
    });

    if (authError) throw authError;

    if (authData.user) {
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert([{
                id: authData.user.id,
                full_name: userData.fullName,
                university_roll_no: userData.rollNo,
                regulation: userData.regulation
            }]);

        if (profileError) throw profileError;
    }

    return authData.user;
}

// ============================================
// 🛣️ API ROUTES
// ============================================

app.post('/signup-with-otp', async (req, res) => {
    try {
        const { email, password, fullName, rollNo, regulation } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const otp = generateOTP();

        pendingUsers.set(email, {
            email,
            password: password,
            fullName,
            rollNo,
            regulation,
            createdAt: Date.now(),
        });

        verificationCodes.set(email, {
            code: otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        await sendOTPEmail(email, otp);

        res.status(200).json({
            message: 'OTP sent to your email. Please verify to complete signup.',
            email: email,
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to send verification email' });
    }
});

app.post('/signup-with-link', async (req, res) => {
    try {
        const { email, password, fullName, rollNo, regulation } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const token = generateToken();

        pendingUsers.set(email, {
            email,
            password,
            fullName,
            rollNo,
            regulation,
            createdAt: Date.now(),
        });

        verificationCodes.set(token, {
            email: email,
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        const baseUrl = `https://${req.headers.host}`;
        await sendVerificationLinkEmail(email, token, baseUrl);

        res.status(200).json({
            message: 'Verification link sent to your email. Please check your inbox.',
            email: email,
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to send verification email' });
    }
});

app.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const storedData = verificationCodes.get(email);

        if (!storedData) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({ error: 'OTP has expired' });
        }

        if (storedData.code !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const user = await finalizeUserCreation(email);
        console.log('✅ User verified and created:', email);

        pendingUsers.delete(email);
        verificationCodes.delete(email);

        res.status(200).json({
            message: 'Email verified successfully! Account created.',
            user: { email: user.email },
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message || 'Verification failed' });
    }
});

app.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        const storedData = verificationCodes.get(token);

        if (!storedData) {
            return res.status(400).send(`<h1>❌ Invalid or Expired Link</h1>`);
        }

        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(token);
            return res.status(400).send(`<h1>⏰ Link Expired</h1>`);
        }

        const email = storedData.email;
        const user = await finalizeUserCreation(email);
        console.log('✅ User verified and created via link:', email);

        pendingUsers.delete(email);
        verificationCodes.delete(token);

        res.status(200).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #28a745;">✅ Email Verified!</h1>
        <p style="font-size: 18px;">Your account has been successfully created.</p>
        <p>You can now open the app and log in.</p>
      </div>
    `);

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).send(`<h1>❌ Verification Failed</h1><p>${error.message}</p>`);
    }
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const otp = generateOTP();

        verificationCodes.set(`reset:${email}`, {
            code: otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        await sendResetOTPEmail(email, otp);

        res.status(200).json({ message: 'Reset OTP sent to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send reset email' });
    }
});

app.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required' });
        }

        const storedData = verificationCodes.get(`reset:${email}`);
        if (!storedData || storedData.code !== otp || Date.now() > storedData.expiresAt) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const user = users.find(u => u.email === email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: newPassword
        });

        if (updateError) throw updateError;

        verificationCodes.delete(`reset:${email}`);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: error.message || 'Failed to reset password' });
    }
});

// Export for Vercel serverless
module.exports = app;
