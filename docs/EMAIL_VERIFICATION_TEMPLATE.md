# Email Verification Template for Supabase

## Overview
This is a personalized email verification template for Syntera. Configure this in your Supabase dashboard.

## Setup Instructions

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Replace the default template with the HTML below
4. Customize the variables as needed

## Email Template HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Syntera Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
              <div style="display: inline-block; width: 48px; height: 48px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" fill="white"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Welcome to Syntera!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #404040; font-size: 16px; line-height: 1.6;">
                Hi {{ .Name | default "there" }},
              </p>
              
              <p style="margin: 0 0 24px; color: #404040; font-size: 16px; line-height: 1.6;">
                Thank you for signing up for Syntera! We're excited to have you join our community of businesses transforming customer interactions with AI-powered agents.
              </p>
              
              <p style="margin: 0 0 32px; color: #404040; font-size: 16px; line-height: 1.6;">
                To get started, please verify your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #737373; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 32px; color: #6366f1; font-size: 14px; word-break: break-all; line-height: 1.5;">
                {{ .ConfirmationURL }}
              </p>
              
              <div style="border-top: 1px solid #e5e5e5; padding-top: 24px; margin-top: 32px;">
                <p style="margin: 0 0 12px; color: #737373; font-size: 14px; line-height: 1.5;">
                  <strong>What's next?</strong>
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #737373; font-size: 14px; line-height: 1.8;">
                  <li>Set up your first AI agent</li>
                  <li>Connect your communication channels</li>
                  <li>Start transforming customer interactions</li>
                </ul>
              </div>
              
              <p style="margin: 24px 0 0; color: #737373; font-size: 12px; line-height: 1.5;">
                This verification link will expire in 24 hours. If you didn't create an account with Syntera, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px; color: #737373; font-size: 12px; text-align: center;">
                <strong style="color: #404040;">Syntera</strong> - AI-Powered Universal Agent Platform
              </p>
              <p style="margin: 0; color: #a3a3a3; font-size: 11px; text-align: center;">
                © {{ .Year }} Syntera. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Plain Text Version (for email clients that don't support HTML)

```
Welcome to Syntera!

Hi {{ .Name | default "there" }},

Thank you for signing up for Syntera! We're excited to have you join our community of businesses transforming customer interactions with AI-powered agents.

To verify your email address, please click the link below:

{{ .ConfirmationURL }}

This verification link will expire in 24 hours.

What's next?
- Set up your first AI agent
- Connect your communication channels
- Start transforming customer interactions

If you didn't create an account with Syntera, you can safely ignore this email.

---
Syntera - AI-Powered Universal Agent Platform
© 2025 Syntera. All rights reserved.
```

## Supabase Variables

Supabase provides these variables in email templates:
- `{{ .ConfirmationURL }}` - The verification link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Verification token (if needed)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after verification

## Customization

You can customize:
- Colors: Update the gradient colors to match your brand
- Logo: Replace the SVG icon with your actual logo
- Content: Modify the welcome message and next steps
- Styling: Adjust padding, fonts, and spacing

## Testing

1. Send a test email from Supabase dashboard
2. Check email rendering in different clients (Gmail, Outlook, etc.)
3. Verify the confirmation link works
4. Test on mobile devices

