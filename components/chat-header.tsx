'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Bot } from 'lucide-react'

interface ChatHeaderProps {
  messageCount: number
  onClear: () => void
}

export function ChatHeader({ messageCount, onClear }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Powered by Kimi K2</p>
          </div>
        </div>
        
        {messageCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear chat
          </Button>
        )}
      </div>
    </header>
  )
}
