'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatHeader } from './chat-header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { ChatEmptyState } from './chat-empty-state'
import { ChatSidebar, ChatSession } from './chat-sidebar'
import { Loader2 } from 'lucide-react'

const STORAGE_KEY = 'chat-sessions'

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function getSessionTitle(messages: Array<{ role: string; parts?: Array<{ type: string; text: string }> }>) {
  const firstUserMsg = messages.find(m => m.role === 'user')
  if (!firstUserMsg?.parts) return 'New conversation'
  const text = firstUserMsg.parts.filter(p => p.type === 'text').map(p => p.text).join('')
  return text.slice(0, 40) + (text.length > 40 ? '...' : '') || 'New conversation'
}

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatSession[]
        setSessions(parsed)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save sessions to localStorage when they change
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    setSessions(newSessions)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions))
  }, [])

  // Save current messages to session when they change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => {
        const updated = prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, messages: messages as ChatSession['messages'], title: getSessionTitle(messages as ChatSession['messages']) }
            : s
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }, [messages, currentSessionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text: string) => {
    // Create new session if none exists
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: generateId(),
        title: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
        createdAt: Date.now(),
        messages: []
      }
      const newSessions = [newSession, ...sessions]
      saveSessions(newSessions)
      setCurrentSessionId(newSession.id)
    }
    sendMessage({ text })
  }

  const handleClear = () => {
    setMessages([])
    setCurrentSessionId(null)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion)
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentSessionId(null)
  }

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id)
    if (session) {
      setCurrentSessionId(id)
      setMessages(session.messages as Parameters<typeof setMessages>[0])
    }
  }

  const handleDeleteSession = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id)
    saveSessions(newSessions)
    if (currentSessionId === id) {
      setMessages([])
      setCurrentSessionId(null)
    }
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
      />
      
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader 
          messageCount={messages.length} 
          onClear={handleClear} 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <ChatEmptyState onSuggestionClick={handleSuggestionClick} />
            ) : (
              <div className="py-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3 px-4 py-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 bg-card text-card-foreground shadow-sm border border-border">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>
        
        <footer className="border-t border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto p-4">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
            <p className="text-xs text-muted-foreground text-center mt-3">
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
