/**
 * Team Management Routes
 * Handles team invitations and member management
 */

import express from 'express'
import { z } from 'zod'
import { supabase } from '../config/database.js'
import { authenticate, requireCompany, AuthenticatedRequest } from '../middleware/auth.js'
import { handleError, notFound, forbidden, badRequest } from '../utils/errors.js'
import { createLogger } from '@syntera/shared/logger/index.js'
import crypto from 'crypto'
import { sendEmail } from '../utils/email.js'
import { generateInvitationEmailHtml, generateInvitationEmailText } from '../utils/invitation-email.js'

const logger = createLogger('agent-service:team')
const router = express.Router()

// Validation schemas
const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin']).default('user'),
})

const UpdateMemberRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
})

/**
 * GET /api/team/members
 * List all team members for the company
 */
router.get(
  '/members',
  authenticate,
  requireCompany,
  async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.company_id!

      // Get all users in the company
      const { data: members, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url, role, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Failed to fetch team members', { error: error.message, companyId })
        return res.status(500).json({ error: 'Failed to fetch team members' })
      }

      res.json({ members: members || [] })
    } catch (error) {
      handleError(error, res)
    }
  }
)

/**
 * GET /api/team/invitations
 * List all pending invitations for the company
 */
router.get(
  '/invitations',
  authenticate,
  requireCompany,
  async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.company_id!

      // Get all pending invitations
      const { data: invitations, error } = await supabase
        .from('team_invitations')
        .select('id, email, role, invited_by, expires_at, created_at')
        .eq('company_id', companyId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Failed to fetch invitations', { error: error.message, companyId })
        return res.status(500).json({ error: 'Failed to fetch invitations' })
      }

      res.json({ invitations: invitations || [] })
    } catch (error) {
      handleError(error, res)
    }
  }
)

/**
 * POST /api/team/invite
 * Invite a user to join the company
 */
router.post(
  '/invite',
  authenticate,
  requireCompany,
  async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.company_id!
      const userId = req.user!.id

      // Check if user has permission (owner or admin)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        return res.status(404).json({ error: 'User not found' })
      }

      if (userData.role !== 'owner' && userData.role !== 'admin') {
        return forbidden(res, 'Only owners and admins can invite team members')
      }

      // Validate input
      const validationResult = InviteUserSchema.safeParse(req.body)
      if (!validationResult.success) {
        return badRequest(res, validationResult.error.issues[0].message)
      }

      const { email, role } = validationResult.data

      // Check if user already exists in company
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('company_id', companyId)
        .maybeSingle()

      if (existingUser) {
        return badRequest(res, 'User is already a member of your company')
      }

      // Check if there's a pending invitation
      const { data: existingInvitation } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('company_id', companyId)
        .eq('email', email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (existingInvitation) {
        return badRequest(res, 'An invitation has already been sent to this email')
      }

      // Generate invitation token
      const token = `inv_${crypto.randomBytes(32).toString('hex')}`

      // Create invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
          company_id: companyId,
          email,
          role,
          invited_by: userId,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single()

      if (inviteError) {
        logger.error('Failed to create invitation', { 
          error: inviteError.message, 
          companyId, 
          email 
        })
        return res.status(500).json({ error: 'Failed to create invitation' })
      }

      // Get company name and inviter name for email
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single()

      const { data: inviter } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single()

      // Generate invitation URL
      const frontendUrl = process.env.FRONTEND_URL || 'https://syntera-tau.vercel.app'
      const invitationUrl = `${frontendUrl}/invite/${token}`

      // Send invitation email
      try {
        await sendEmail({
          to: email,
          subject: `You've been invited to join ${company?.name || 'a team'} on Syntera`,
          html: generateInvitationEmailHtml({
            inviteeEmail: email,
            inviterName: inviter?.name || inviter?.email,
            companyName: company?.name || 'the team',
            role,
            invitationUrl,
            expiresInDays: 7,
          }),
          text: generateInvitationEmailText({
            inviteeEmail: email,
            inviterName: inviter?.name || inviter?.email,
            companyName: company?.name || 'the team',
            role,
            invitationUrl,
            expiresInDays: 7,
          }),
        })

        logger.info('Invitation email sent', { 
          invitationId: invitation.id, 
          email, 
          companyId 
        })
      } catch (emailError: any) {
        logger.error('Failed to send invitation email', {
          error: emailError?.message,
          invitationId: invitation.id,
          email,
          companyId,
        })
        // Don't fail the request if email fails - invitation is still created
        // User can resend invitation later if needed
      }

      logger.info('Team invitation created', { 
        invitationId: invitation.id, 
        companyId, 
        email, 
        role 
      })

      res.status(201).json({ 
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expires_at: invitation.expires_at,
          created_at: invitation.created_at,
        },
      })
    } catch (error) {
      handleError(error, res)
    }
  }
)

/**
 * POST /api/team/invitations/:token/accept
 * Accept a team invitation
 */
router.post(
  '/invitations/:token/accept',
  async (req, res) => {
    try {
      const { token } = req.params

      // Find invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .single()

      if (inviteError || !invitation) {
        return notFound(res, 'Invitation', token)
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Invitation has expired' })
      }

      // Check if user is authenticated (they need to be logged in to accept)
      // For now, we'll require authentication
      // In a full implementation, we might allow signup during acceptance

      // This endpoint should be called after user signs up or logs in
      // The frontend will handle the authentication flow

      res.json({ 
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          company_id: invitation.company_id,
          expires_at: invitation.expires_at,
        },
        message: 'Invitation found. Please sign in or sign up to accept.',
      })
    } catch (error) {
      handleError(error, res)
    }
  }
)

/**
 * POST /api/team/invitations/:token/accept-authenticated
 * Accept invitation (requires authentication)
 */
router.post(
  '/invitations/:token/accept-authenticated',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { token } = req.params
      const userId = req.user!.id
      const userEmail = req.user!.email

      // Find invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .single()

      if (inviteError || !invitation) {
        return notFound(res, 'Invitation', token)
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Invitation has expired' })
      }

      // Verify email matches
      if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
        return res.status(403).json({ 
          error: 'Invitation email does not match your account email' 
        })
      }

      // Check if user already has a company
      const { data: existingUser } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single()

      if (existingUser?.company_id) {
        // User already has a company - add them to the new company
        // For now, we'll update their company_id (in a multi-company setup, 
        // you might want to allow multiple companies)
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            company_id: invitation.company_id,
            role: invitation.role,
          })
          .eq('id', userId)

        if (updateError) {
          logger.error('Failed to update user company', { 
            error: updateError.message, 
            userId, 
            companyId: invitation.company_id 
          })
          return res.status(500).json({ error: 'Failed to accept invitation' })
        }
      } else {
        // User doesn't have a company - create user record
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: userEmail,
            company_id: invitation.company_id,
            role: invitation.role,
          })

        if (insertError) {
          logger.error('Failed to create user record', { 
            error: insertError.message, 
            userId, 
            companyId: invitation.company_id 
          })
          return res.status(500).json({ error: 'Failed to accept invitation' })
        }
      }

      // Mark invitation as accepted
      const { error: acceptError } = await supabase
        .from('team_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      if (acceptError) {
        logger.error('Failed to mark invitation as accepted', { 
          error: acceptError.message, 
          invitationId: invitation.id 
        })
        // Don't fail the request, invitation is effectively accepted
      }

      logger.info('Team invitation accepted', { 
        invitationId: invitation.id, 
        userId, 
        companyId: invitation.company_id 
      })

      res.json({ 
        message: 'Invitation accepted successfully',
        company_id: invitation.company_id,
      })
    } catch (error) {
      handleError(error, res)
    }
  }
)

/**
 * DELETE /api/team/invitations/:id
 * Cancel/delete an invitation
 */
router.delete(
  '/invitations/:id',
  authenticate,
  requireCompany,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params
      const companyId = req.user!.company_id!
      const userId = req.user!.id

      // Check if user has permission
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userData?.role !== 'owner' && userData?.role !== 'admin') {
        return forbidden(res, 'Only owners and admins can delete invitations')
      }

      // Check if invitation exists and belongs to company
      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .select('id, company_id')
        .eq('id', id)
        .single()

      if (inviteError || !invitation) {
        return notFound(res, 'Invitation', id)
      }

      if (invitation.company_id !== companyId) {
        return forbidden(res, 'Invitation does not belong to your company')
      }

      // Delete invitation
      const { error: deleteError } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId)

      if (deleteError) {
        logger.error('Failed to delete invitation', { 
          error: deleteError.message, 
          invitationId: id 
        })
        return res.status(500).json({ error: 'Failed to delete invitation' })
      }

      res.status(204).send()
    } catch (error) {
      handleError(error, res)
    }
  }
)

/**
 * PATCH /api/team/members/:id/role
 * Update a team member's role
 */
router.patch(
  '/members/:id/role',
  authenticate,
  requireCompany,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params
      const companyId = req.user!.company_id!
      const userId = req.user!.id

      // Check if user has permission (owner or admin)
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userData?.role !== 'owner' && userData?.role !== 'admin') {
        return forbidden(res, 'Only owners and admins can update member roles')
      }

      // Validate input
      const validationResult = UpdateMemberRoleSchema.safeParse(req.body)
      if (!validationResult.success) {
        return badRequest(res, validationResult.error.issues[0].message)
      }

      const { role } = validationResult.data

      // Check if member exists and belongs to company
      const { data: member, error: memberError } = await supabase
        .from('users')
        .select('id, company_id, role')
        .eq('id', id)
        .single()

      if (memberError || !member) {
        return notFound(res, 'Team member', id)
      }

      if (member.company_id !== companyId) {
        return forbidden(res, 'Member does not belong to your company')
      }

      // Prevent changing owner role
      if (member.role === 'owner') {
        return forbidden(res, 'Cannot change owner role')
      }

      // Prevent non-owners from changing roles to admin
      if (role === 'admin' && userData.role !== 'owner') {
        return forbidden(res, 'Only owners can assign admin role')
      }

      // Update role
      const { data: updatedMember, error: updateError } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('company_id', companyId)
        .select('id, email, name, role')
        .single()

      if (updateError) {
        logger.error('Failed to update member role', { 
          error: updateError.message, 
          memberId: id 
        })
        return res.status(500).json({ error: 'Failed to update member role' })
      }

      logger.info('Team member role updated', { 
        memberId: id, 
        newRole: role, 
        companyId 
      })

      res.json({ member: updatedMember })
    } catch (error) {
      handleError(error, res)
    }
  }
)

/**
 * DELETE /api/team/members/:id
 * Remove a team member from the company
 */
router.delete(
  '/members/:id',
  authenticate,
  requireCompany,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params
      const companyId = req.user!.company_id!
      const userId = req.user!.id

      // Check if user has permission (owner or admin)
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userData?.role !== 'owner' && userData?.role !== 'admin') {
        return forbidden(res, 'Only owners and admins can remove team members')
      }

      // Check if member exists and belongs to company
      const { data: member, error: memberError } = await supabase
        .from('users')
        .select('id, company_id, role')
        .eq('id', id)
        .single()

      if (memberError || !member) {
        return notFound(res, 'Team member', id)
      }

      if (member.company_id !== companyId) {
        return forbidden(res, 'Member does not belong to your company')
      }

      // Prevent removing owner
      if (member.role === 'owner') {
        return forbidden(res, 'Cannot remove company owner')
      }

      // Prevent removing yourself
      if (member.id === userId) {
        return badRequest(res, 'Cannot remove yourself from the team')
      }

      // Remove member (set company_id to null)
      const { error: removeError } = await supabase
        .from('users')
        .update({ 
          company_id: null,
          role: 'user', // Reset to default role
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)

      if (removeError) {
        logger.error('Failed to remove team member', { 
          error: removeError.message, 
          memberId: id 
        })
        return res.status(500).json({ error: 'Failed to remove team member' })
      }

      logger.info('Team member removed', { memberId: id, companyId })

      res.status(204).send()
    } catch (error) {
      handleError(error, res)
    }
  }
)

export default router

