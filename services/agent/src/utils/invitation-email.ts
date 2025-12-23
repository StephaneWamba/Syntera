/**
 * Invitation Email Templates
 * HTML templates for team invitation emails
 */

export interface InvitationEmailData {
  inviteeEmail: string
  inviterName?: string
  companyName: string
  role: 'user' | 'admin'
  invitationUrl: string
  expiresInDays: number
}

/**
 * Generate HTML email template for team invitation
 */
export function generateInvitationEmailHtml(data: InvitationEmailData): string {
  const roleLabel = data.role === 'admin' ? 'Administrator' : 'Team Member'
  const baseUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || 'https://syntera-tau.vercel.app'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited to join ${data.companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                You've been invited!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi there,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                ${data.inviterName ? `<strong>${data.inviterName}</strong>` : 'Someone'} has invited you to join <strong>${data.companyName}</strong> on Syntera as a <strong>${roleLabel}</strong>.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                Syntera is an AI-powered platform that helps teams build and deploy conversational AI agents. As a ${roleLabel.toLowerCase()}, you'll be able to ${data.role === 'admin' ? 'manage agents, workflows, and team members' : 'view and interact with AI agents'}.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${data.invitationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #666666;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; font-size: 12px; line-height: 1.6; color: #999999; word-break: break-all;">
                ${data.invitationUrl}
              </p>
              
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                This invitation will expire in ${data.expiresInDays} day${data.expiresInDays !== 1 ? 's' : ''}. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                This email was sent by <a href="${baseUrl}" style="color: #0070f3; text-decoration: none;">Syntera</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of invitation email
 */
export function generateInvitationEmailText(data: InvitationEmailData): string {
  const roleLabel = data.role === 'admin' ? 'Administrator' : 'Team Member'
  
  return `
You've been invited to join ${data.companyName} on Syntera!

Hi there,

${data.inviterName ? `${data.inviterName} has` : 'Someone has'} invited you to join ${data.companyName} on Syntera as a ${roleLabel}.

Syntera is an AI-powered platform that helps teams build and deploy conversational AI agents. As a ${roleLabel.toLowerCase()}, you'll be able to ${data.role === 'admin' ? 'manage agents, workflows, and team members' : 'view and interact with AI agents'}.

Accept your invitation by clicking this link:
${data.invitationUrl}

This invitation will expire in ${data.expiresInDays} day${data.expiresInDays !== 1 ? 's' : ''}. If you didn't expect this invitation, you can safely ignore this email.

---
This email was sent by Syntera
  `.trim()
}

