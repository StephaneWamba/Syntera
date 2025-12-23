/**
 * Team Management API Client
 * React Query hooks for team operations
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
export interface TeamMember {
  id: string
  email: string
  name?: string | null
  avatar_url?: string | null
  role: 'owner' | 'admin' | 'user'
  created_at: string
}

export interface TeamInvitation {
  id: string
  email: string
  role: 'user' | 'admin'
  invited_by: string
  expires_at: string
  created_at: string
}

export interface InviteUserInput {
  email: string
  role: 'user' | 'admin'
}

export interface UpdateMemberRoleInput {
  role: 'user' | 'admin'
}

// API functions
async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch('/api/team/members', {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch team members' }))
      throw new Error(error.error || `Failed to fetch team members: ${response.status}`)
    }
    
    const data = await response.json()
    // Response is already extracted by proxy (extractNestedData: 'members')
    // So data is either the array directly or { members: [...] }
    if (Array.isArray(data)) {
      return data
    }
    return data.members || []
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: Team service is not responding')
    }
    throw error
  }
}

async function fetchInvitations(): Promise<TeamInvitation[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch('/api/team/invitations', {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch invitations' }))
      throw new Error(error.error || `Failed to fetch invitations: ${response.status}`)
    }
    
    const data = await response.json()
    // Response is already extracted by proxy (extractNestedData: 'invitations')
    // So data is either the array directly or { invitations: [...] }
    if (Array.isArray(data)) {
      return data
    }
    return data.invitations || []
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: Team service is not responding')
    }
    throw error
  }
}

async function inviteUser(input: InviteUserInput): Promise<{ invitation: TeamInvitation; token?: string }> {
  const response = await fetch('/api/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to invite user' }))
    throw new Error(error.error || 'Failed to invite user')
  }
  return await response.json()
}

async function acceptInvitation(token: string): Promise<{ message: string; company_id: string }> {
  const response = await fetch(`/api/team/invitations/${token}/accept-authenticated`, {
    method: 'POST',
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to accept invitation' }))
    throw new Error(error.error || 'Failed to accept invitation')
  }
  return await response.json()
}

async function deleteInvitation(id: string): Promise<void> {
  const response = await fetch(`/api/team/invitations/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete invitation')
  }
}

async function updateMemberRole(memberId: string, input: UpdateMemberRoleInput): Promise<TeamMember> {
  const response = await fetch(`/api/team/members/${memberId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update member role' }))
    throw new Error(error.error || 'Failed to update member role')
  }
  const data = await response.json()
  return data.member
}

async function removeMember(memberId: string): Promise<void> {
  const response = await fetch(`/api/team/members/${memberId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove member')
  }
}

// React Query hooks
export function useTeamMembers() {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: fetchTeamMembers,
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInvitations() {
  return useQuery({
    queryKey: ['team', 'invitations'],
    queryFn: fetchInvitations,
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'invitations'] })
      toast.success('Invitation sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation')
    },
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] })
      queryClient.invalidateQueries({ queryKey: ['team', 'invitations'] })
      toast.success('Invitation accepted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept invitation')
    },
  })
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'invitations'] })
      toast.success('Invitation cancelled')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel invitation')
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'user' | 'admin' }) =>
      updateMemberRole(memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] })
      toast.success('Member role updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update member role')
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] })
      toast.success('Member removed from team')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })
}

