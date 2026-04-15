import { createFireworks } from '@ai-sdk/fireworks'
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

// Create Fireworks client with official SDK
const fireworks = createFireworks({
  apiKey: process.env.FIREWORKS_API_KEY,
})

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    console.log('[v0] FIREWORKS_API_KEY exists:', !!process.env.FIREWORKS_API_KEY)
    console.log('[v0] FIREWORKS_API_KEY length:', process.env.FIREWORKS_API_KEY?.length || 0)

    const result = streamText({
      model: fireworks('accounts/fireworks/models/kimi-k2-instruct'),
      system: `You are a helpful, friendly AI assistant. You provide clear, concise, and accurate responses. 
You are knowledgeable across many topics and always aim to be helpful while being honest about your limitations.`,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ isAborted }) => {
        if (isAborted) return
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get response from AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
