'use client'

import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  messages: Array<{
    id: string
    role: string
    parts?: Array<{ type: string; text: string }>
  }>
}

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
  isOpen: boolean
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
}: ChatSidebarProps) {
  if (!isOpen) return null

  return (
    <aside className="w-64 border-r border-border bg-secondary/30 flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full gap-2"
          variant="default"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 py-2">
          Chat History
        </p>
        
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-4 text-center">
            No conversations yet
          </p>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                  currentSessionId === session.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">
                  {session.title || 'New conversation'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
