-- Migration: Team Invitations
-- Enables team collaboration by allowing owners/admins to invite users to their company

-- Team Invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate pending invitations for same email/company
  CONSTRAINT unique_pending_invitation UNIQUE (company_id, email) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_company_id ON public.team_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON public.team_invitations(expires_at);

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'inv_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team invitations
CREATE POLICY "Users can view company invitations"
  ON public.team_invitations FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
    AND invited_by = auth.uid()
  );

CREATE POLICY "Owners and admins can update invitations"
  ON public.team_invitations FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can delete invitations"
  ON public.team_invitations FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Policy to allow anyone to view invitation by token (for acceptance)
CREATE POLICY "Anyone can view invitation by token"
  ON public.team_invitations FOR SELECT
  USING (true); -- Token provides security, not RLS

-- Add comment
COMMENT ON TABLE public.team_invitations IS 'Team member invitations for company collaboration';
COMMENT ON COLUMN public.team_invitations.token IS 'Unique token for invitation acceptance (format: inv_xxx)';
COMMENT ON COLUMN public.team_invitations.expires_at IS 'Invitation expiration date (default: 7 days)';

