import sgMail from '@sendgrid/mail';
import { BRAND } from '@/lib/brand/constants';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = 'noreply@echotales.com';
const FROM_NAME = BRAND.name;

// Get app URL
const getAppUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

/**
 * Generate HTML email template for verification
 */
function generateVerificationEmailHtml(name: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #581c87 0%, #831843 100%); min-height: 100vh;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #581c87 0%, #831843 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
              <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                Welcome to ${BRAND.name}!
              </h1>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #7c3aed;">${name || 'there'}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! Please verify your email address to start exploring our creative and learning tools for families.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 10px 0 30px;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: #fff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; padding: 12px; background: #f3f4f6; border-radius: 8px; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #7c3aed; text-decoration: none; font-size: 13px;">${verificationUrl}</a>
              </p>

              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                ${BRAND.name} - ${BRAND.tagline}<br>
                ${BRAND.legalEntity}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Generate HTML email template for password reset
 */
function generatePasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #581c87 0%, #831843 100%); min-height: 100vh;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #581c87 0%, #831843 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                Reset Your Password
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #7c3aed;">${name || 'there'}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 10px 0 30px;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: #fff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; padding: 12px; background: #f3f4f6; border-radius: 8px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #7c3aed; text-decoration: none; font-size: 13px;">${resetUrl}</a>
              </p>

              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                ${BRAND.name} - ${BRAND.tagline}<br>
                ${BRAND.legalEntity}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string | null,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const appUrl = getAppUrl();
  const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

  const msg = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `Verify your ${BRAND.name} account`,
    text: `
Welcome to ${BRAND.name}!

Hi ${name || 'there'},

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.

---
${BRAND.name} - ${BRAND.tagline}
${BRAND.legalEntity}
    `.trim(),
    html: generateVerificationEmailHtml(name || 'there', verificationUrl),
  };

  try {
    await sgMail.send(msg);
    console.log(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const msg = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `Reset your ${BRAND.name} password`,
    text: `
Reset Your Password

Hi ${name || 'there'},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.

---
${BRAND.name} - ${BRAND.tagline}
${BRAND.legalEntity}
    `.trim(),
    html: generatePasswordResetEmailHtml(name || 'there', resetUrl),
  };

  try {
    await sgMail.send(msg);
    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
