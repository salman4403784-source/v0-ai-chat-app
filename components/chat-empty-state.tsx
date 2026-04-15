'use client'

import { Sparkles } from 'lucide-react'

interface ChatEmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

const suggestions = [
  'Explain quantum computing in simple terms',
  'Write a short story about a robot learning to paint',
  'What are the best practices for React development?',
  'Help me plan a weekend trip to the mountains',
]

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      
      <h1 className="text-2xl font-semibold text-foreground mb-2 text-center text-balance">
        How can I help you today?
      </h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md text-pretty">
        I&apos;m your AI assistant, ready to help with questions, creative tasks, analysis, and more.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-left p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
