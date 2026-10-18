// Sends real email when SMTP is configured; otherwise falls back to a
// console log so local/dev setups keep working with zero configuration.
//
// Configure via .env (SMTP_* or EMAIL_* both work):
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
//   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
//
// Works with any standard SMTP provider — Gmail (App Password), Outlook,
// SendGrid, Mailgun, Resend, AWS SES SMTP, Brevo, a company mail server, etc.

const nodemailer = require('nodemailer');

const BRAND_NAME = 'Ardhnarishwar';

let transporter = null;
let loggedConfigState = false;

function cfg() {
  return {
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
    port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    // Gmail App Passwords are shown with spaces; strip them just in case.
    pass: String(process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
    secureFlag: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM || '',
  };
}

function isConfigured() {
  const c = cfg();
  return Boolean(c.host && c.user && c.pass);
}

/**
 * Builds the "From" header so the inbox always shows "Ardhnarishwar".
 *  - ""Ardhnarishwar" <a@b.com>"  -> used as is
 *  - "a@b.com"                    -> "Ardhnarishwar" <a@b.com>
 *  - "Ardhnarishwar" (name only)  -> "Ardhnarishwar" <SMTP_USER>
 *  - empty                        -> "Ardhnarishwar" <SMTP_USER>
 */
function buildFrom() {
  const c = cfg();
  const raw = String(c.from || '').trim().replace(/^["']+|["']+$/g, '');

  if (raw.includes('<') && raw.includes('>')) return c.from.trim();
  if (raw.includes('@')) return `"${BRAND_NAME}" <${raw}>`;
  return `"${raw || BRAND_NAME}" <${c.user}>`;
}

function getTransporter() {
  if (!isConfigured()) return null;
  if (transporter) return transporter;

  const c = cfg();
  transporter = nodemailer.createTransport({
    host: c.host,
    port: c.port,
    // true for port 465 (implicit TLS), false for 587/25 (STARTTLS)
    secure: c.secureFlag || c.port === 465,
    auth: { user: c.user, pass: c.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured. Never throws — a mail failure
 * should never break registration/login; callers just get `false` back
 * and the OTP is still available in the server console as a fallback.
 */
async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();

  if (!t) {
    if (!loggedConfigState) {
      console.log('[mailer] SMTP not configured — emails will only be logged to this console. See backend/.env.example (SMTP_HOST/SMTP_USER/SMTP_PASS) to send real emails.');
      loggedConfigState = true;
    }
    return false;
  }

  try {
    await t.sendMail({
      from: buildFrom(),
      to,
      subject,
      text,
      html,
    });
    console.log(`[mailer] Email sent to ${to}: "${subject}"`);
    return true;
  } catch (err) {
    console.error(`[mailer] Failed to send email to ${to}:`, err.message);
    if (err.code) console.error(`[mailer]   code: ${err.code}`);
    if (err.response) console.error(`[mailer]   response: ${err.response}`);
    return false;
  }
}

async function sendOtpEmail({ to, name, otp, purpose }) {
  const subject = purpose === 'resend'
    ? 'Your new verification code'
    : 'Verify your account — OTP inside';

  const text = `Hi ${name || ''},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0f172a;">Verify your account</h2>
      <p style="color: #334155;">Hi ${name || ''},</p>
      <p style="color: #334155;">Use the code below to verify your account. It expires in 10 minutes.</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; background: #f1f5f9; padding: 16px; border-radius: 8px; color: #0f172a;">
        ${otp}
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendOtpEmail, isConfigured };