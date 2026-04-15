'use client'

import { useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatHeader } from './chat-header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { ChatEmptyState } from './chat-empty-state'
import { Loader2 } from 'lucide-react'

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text: string) => {
    sendMessage({ text })
  }

  const handleClear = () => {
    setMessages([])
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader messageCount={messages.length} onClear={handleClear} />
      
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
                  <div className="max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 bg-ai-bubble text-ai-bubble-foreground shadow-sm border border-border">
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
  )
}
