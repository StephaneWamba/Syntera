'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  useTeamMembers, 
  useInvitations, 
  useInviteUser, 
  useDeleteInvitation,
  useUpdateMemberRole,
  useRemoveMember,
  type TeamMember,
  type TeamInvitation,
} from '@/lib/api/team'
import { toast } from 'sonner'
import { UserPlus, Mail, X, Shield, User, Crown, Trash2, MoreVertical } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin']).default('user'),
})

type InviteFormValues = z.infer<typeof inviteSchema>

export default function TeamPage() {
  const router = useRouter()
  const { data: members, isLoading: membersLoading, error: membersError } = useTeamMembers()
  const { data: invitations, isLoading: invitationsLoading, error: invitationsError } = useInvitations()
  const inviteUser = useInviteUser()
  const deleteInvitation = useDeleteInvitation()
  const updateMemberRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'user',
    },
  })

  const onSubmitInvite = async (values: InviteFormValues) => {
    try {
      await inviteUser.mutateAsync(values)
      form.reset()
      setIsInviteDialogOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDeleteInvitation = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return
    }
    try {
      await deleteInvitation.mutateAsync(id)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleUpdateRole = async (memberId: string, role: 'user' | 'admin') => {
    try {
      await updateMemberRole.mutateAsync({ memberId, role })
      setIsRoleDialogOpen(false)
      setSelectedMember(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from your team?')) {
      return
    }
    try {
      await removeMember.mutateAsync(memberId)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      owner: 'default',
      admin: 'secondary',
      user: 'outline',
    }
    return (
      <Badge variant={variants[role] || 'outline'} className="capitalize">
        {getRoleIcon(role)}
        <span className="ml-1">{role}</span>
      </Badge>
    )
  }

  // Get current user to check permissions
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setCurrentUser(data as { id: string; role: string })
          })
      }
    })
  }, [])

  const canManageTeam = currentUser?.role === 'owner' || currentUser?.role === 'admin'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and invitations
          </p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            People who have access to your company's agents and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersError ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Failed to load team members</p>
              <p className="text-sm text-muted-foreground">{membersError.message}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : membersLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading team members...</div>
          ) : members && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageTeam && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name || 'No name'}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    {canManageTeam && member.role !== 'owner' && member.id !== currentUser?.id && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member)
                                setIsRoleDialogOpen(true)
                              }}
                            >
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canManageTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that have been sent but not yet accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsError ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-2">Failed to load invitations</p>
                <p className="text-sm text-muted-foreground">{invitationsError.message}</p>
              </div>
            ) : invitationsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading invitations...</div>
            ) : invitations && invitations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                      <TableCell>
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending invitations
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team. They'll receive an email with instructions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmitInvite)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(value: 'user' | 'admin') => form.setValue('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>User - Can view and chat with agents</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin - Can manage agents and team</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteUser.isPending}>
                {inviteUser.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update {selectedMember?.email}'s role in your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select
                defaultValue={selectedMember?.role === 'owner' ? 'user' : selectedMember?.role}
                onValueChange={(value: 'user' | 'admin') => {
                  if (selectedMember) {
                    handleUpdateRole(selectedMember.id, value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRoleDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

