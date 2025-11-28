# Environment Variables for Notification System

## Agent Service (.env or .env.local)

Add these variables to your Agent Service environment file (`services/agent/.env`):

### Email Service Configuration

```bash
# Email Provider (resend, sendgrid, ses, smtp)
EMAIL_PROVIDER=resend

# Resend API Key
RESEND_API_KEY=re_EHcy5WM8_74vs5FuWZnmXTFaAW6QseeCW

# Default sender email address
EMAIL_FROM=noreply@syntera.ai

# Alternative: SendGrid (if using SendGrid instead)
# SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Service URLs (if not already set)

```bash
# Agent Service
PORT=4002
AGENT_SERVICE_URL=http://localhost:4002

# Chat Service (for internal API calls)
CHAT_SERVICE_URL=http://localhost:4004

# Internal service token (for service-to-service auth)
INTERNAL_SERVICE_TOKEN=your-internal-token-here

# CRM API URL (for deal creation triggers)
CRM_API_URL=http://localhost:3000
```

### Database & Other Services

```bash
# Supabase (should already be set)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MongoDB (should already be set)
MONGODB_URI=mongodb://localhost:27017/syntera

# Redis (should already be set)
REDIS_URL=redis://localhost:6379

# OpenAI (should already be set)
OPENAI_API_KEY=your_openai_api_key

# LiveKit (should already be set)
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

## Frontend (.env.local)

The frontend doesn't need notification-specific env vars, but ensure these are set:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Service URLs
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:4004
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:4002
NEXT_PUBLIC_LIVEKIT_URL=your_livekit_url

# Agent Service URL (for API proxying)
AGENT_SERVICE_URL=http://localhost:4002
```

## Quick Setup

### For Agent Service:

1. Create or update `services/agent/.env`:
```bash
# Email Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_EHcy5WM8_74vs5FuWZnmXTFaAW6QseeCW
EMAIL_FROM=noreply@syntera.ai
```

2. Restart the Agent Service for changes to take effect.

## Testing Email Notifications

To test email notifications:

1. Create a workflow with a "Send Notification" action
2. Set `notification_type` to `email`
3. Set `to` to your email address
4. Trigger the workflow
5. Check your email inbox

## Notes

- **Resend**: Recommended provider, easy setup, good deliverability
- **SendGrid**: Alternative provider, requires `SENDGRID_API_KEY`
- **Email From**: Must be a verified domain in Resend (or your email provider)
- **Default**: If `EMAIL_FROM` is not set, defaults to `noreply@syntera.ai`

## Security

⚠️ **Never commit `.env` files to version control!**

Make sure `.env` and `.env.local` are in your `.gitignore`:

```
.env
.env.local
.env*.local
```




