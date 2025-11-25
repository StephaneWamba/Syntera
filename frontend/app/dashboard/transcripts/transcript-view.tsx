'use client'

import { useState, useEffect } from 'react'
import { useMessages, useConversation, useChatSocket, type Message } from '@/lib/api/chat'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronDown, FolderOpen, Plus, User, Bot } from 'lucide-react'
// Tree-shakeable imports from date-fns (smaller bundle)
import { format } from 'date-fns/format'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { PAGINATION } from '@/lib/constants/api'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

interface TranscriptViewProps {
  conversationId: string
  selectedThreadId: string | null
  onThreadSelect: (threadId: string | null) => void
  token: string | null
}

export function TranscriptView({ conversationId, selectedThreadId, onThreadSelect, token }: TranscriptViewProps) {
  const [messageOffset, setMessageOffset] = useState<number>(0)
  const [accumulatedMessages, setAccumulatedMessages] = useState<Message[]>([])
  const [isCreatingThread, setIsCreatingThread] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState('')
  
  const { data: conversationData } = useConversation(conversationId)
  const conversation = conversationData?.conversation
  const { socket } = useChatSocket(token)
  const { data: messagesData, isLoading: isLoadingMessages, isFetching: isFetchingMessages } = useMessages(
    conversationId,
    {
      limit: PAGINATION.MESSAGES_PAGE_SIZE,
      offset: messageOffset,
      threadId: selectedThreadId, // Filter by selected thread
    }
  )

  // Reset message offset and accumulated messages when thread changes
  useEffect(() => {
    setMessageOffset(0)
    setAccumulatedMessages([])
  }, [selectedThreadId])

  // Accumulate messages when new data arrives
  useEffect(() => {
    if (messagesData && typeof messagesData === 'object' && 'messages' in messagesData) {
      const data = messagesData as { messages: Message[]; total: number }
      if (data.messages) {
        if (messageOffset === 0) {
          // First load or reset - replace all
          setAccumulatedMessages(data.messages)
        } else {
          // Subsequent loads - append new messages
          setAccumulatedMessages(prev => {
            // Avoid duplicates by checking IDs
            const existingIds = new Set(prev.map(m => m._id))
            const newMessages = data.messages.filter(m => !existingIds.has(m._id))
            return [...prev, ...newMessages]
          })
        }
      }
    } else if (messageOffset === 0) {
      // Reset accumulated messages when data is cleared and offset is 0
      setAccumulatedMessages([])
    }
  }, [messagesData, messageOffset])

  const handleCreateThread = () => {
    if (!newThreadTitle.trim()) {
      toast.error('Please enter a thread title')
      return
    }

    if (!socket) {
      toast.error('Not connected. Please wait...')
      return
    }

    socket.emit('thread:create', {
      conversationId,
      title: newThreadTitle.trim(),
    })

    setNewThreadTitle('')
    setIsCreatingThread(false)
    toast.success('Thread created')
  }

  const handleSwitchThread = (threadId: string | null) => {
    if (!socket) {
      toast.error('Not connected. Please wait...')
      return
    }

    socket.emit('thread:switch', {
      conversationId,
      threadId: threadId,
    })

    onThreadSelect(threadId)
  }

  // Properly typed response - API returns { messages: Message[], total: number }
  const messages: Message[] = accumulatedMessages
  const totalMessages = (messagesData && typeof messagesData === 'object' && 'total' in messagesData) 
    ? (messagesData as { messages: Message[]; total: number }).total 
    : 0

  if (isLoadingMessages) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <LoadingSkeleton />
      </Card>
    )
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Threads Sidebar */}
      <div className="hidden lg:flex w-64 shrink-0">
        <Card className="w-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Threads</CardTitle>
              <Dialog open={isCreatingThread} onOpenChange={setIsCreatingThread}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Thread</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="thread-title">Thread Title</Label>
                      <Input
                        id="thread-title"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        placeholder="e.g., Sales Discussion, Support Issue"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateThread()
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingThread(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateThread}>Create</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-1">
            <Button
              variant={selectedThreadId === null ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start h-auto py-2 px-2',
                selectedThreadId === null && 'bg-primary text-primary-foreground'
              )}
              onClick={() => handleSwitchThread(null)}
            >
              <FolderOpen className="h-4 w-4 mr-2 shrink-0" />
              <span className="text-sm">All Messages</span>
            </Button>
            {conversation?.threads?.map((thread) => (
              <Button
                key={thread.id}
                variant={selectedThreadId === thread.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-auto py-2 px-2',
                  selectedThreadId === thread.id && 'bg-primary text-primary-foreground'
                )}
                onClick={() => handleSwitchThread(thread.id)}
              >
                <FolderOpen className="h-4 w-4 mr-2 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm truncate">{thread.title}</p>
                  {thread.message_count !== undefined && (
                    <p className="text-xs opacity-70">{thread.message_count} messages</p>
                  )}
                </div>
              </Button>
            ))}
            {(!conversation?.threads || conversation.threads.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No threads yet. Create one to organize this transcript.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transcript Content */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conversation Transcript</CardTitle>
              <CardDescription>
                {conversation && (
                  <>
                    Started {format(new Date(conversation.started_at), 'PPp')}
                    {conversation.ended_at && (
                      <> • Ended {format(new Date(conversation.ended_at), 'PPp')}</>
                    )}
                    {selectedThreadId && conversation.threads?.find(t => t.id === selectedThreadId) && (
                      <> • Thread: {conversation.threads.find(t => t.id === selectedThreadId)?.title ?? ''}</>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {totalMessages} messages
            </Badge>
          </div>
        </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No messages"
            description="This conversation has no messages yet"
          />
        ) : (
          <>
            {messages.map((message) => {
              const isUser = message.sender_type === 'user'
              
              // Clean content - remove JSON array formatting if present
              let cleanContent = message.content
              if (typeof cleanContent === 'string' && cleanContent.startsWith('[') && cleanContent.endsWith(']')) {
                try {
                  const parsed = JSON.parse(cleanContent)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    cleanContent = String(parsed[0])
                  } else if (typeof parsed === 'string') {
                    cleanContent = parsed
                  }
                } catch {
                  cleanContent = cleanContent.replace(/^\[|\]$/g, '').replace(/^["']|["']$/g, '')
                }
              }
              
              return (
                <div
                  key={message._id}
                  className={cn(
                    'flex gap-3 p-4 rounded-lg',
                    isUser 
                      ? 'bg-blue-600 text-white ml-auto max-w-[75%] rounded-br-sm' 
                      : 'bg-muted text-foreground mr-auto max-w-[75%] rounded-bl-sm',
                    'shadow-sm'
                  )}
                  style={{
                    marginLeft: isUser ? 'auto' : '0',
                    marginRight: isUser ? '0' : 'auto',
                  }}
                >
                  {!isUser && (
                    <div className="flex-shrink-0">
                      <Bot className={cn(
                        "h-5 w-5 mt-0.5",
                        "text-muted-foreground"
                      )} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "flex items-center gap-2 mb-2",
                      isUser && "text-blue-50"
                    )}>
                      <span className={cn(
                        "text-xs",
                        isUser ? "text-blue-200/80" : "text-muted-foreground"
                      )}>
                        {format(new Date(message.created_at), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className={cn(
                      "text-sm whitespace-pre-wrap break-words",
                      isUser ? "text-white" : "text-foreground"
                    )}>
                      {cleanContent}
                    </div>
                    {message.metadata?.intent && (
                      <div className={cn(
                        "mt-2 text-xs",
                        isUser ? "text-blue-200/80" : "text-muted-foreground"
                      )}>
                        Intent: {message.metadata.intent.category} 
                        {message.metadata.intent.confidence && (
                          <> ({Math.round(message.metadata.intent.confidence * 100)}%)</>
                        )}
                      </div>
                    )}
                    {message.metadata?.sentiment && (
                      <div className={cn(
                        "mt-1 text-xs",
                        isUser ? "text-blue-200/80" : "text-muted-foreground"
                      )}>
                        Sentiment: {message.metadata.sentiment.sentiment}
                        {message.metadata.sentiment.score && (
                          <> (score: {message.metadata.sentiment.score.toFixed(2)})</>
                        )}
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <div className="flex-shrink-0">
                      <User className={cn(
                        "h-5 w-5 mt-0.5",
                        "text-blue-200"
                      )} />
                    </div>
                  )}
                </div>
              )
            })}
            
            {typeof totalMessages === 'number' && totalMessages > messageOffset + messages.length && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setMessageOffset(prev => prev + PAGINATION.MESSAGES_PAGE_SIZE)}
                disabled={isFetchingMessages}
              >
                {isFetchingMessages ? (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load more messages ({typeof totalMessages === 'number' ? totalMessages - (messageOffset + messages.length) : 0} remaining)
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
      </Card>
    </div>
  )
}