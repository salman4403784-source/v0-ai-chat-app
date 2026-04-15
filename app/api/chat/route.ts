import { streamText } from 'ai'
import { createFireworks } from '@ai-sdk/fireworks'

export const maxDuration = 60

const fireworks = createFireworks({
  apiKey: 'fw_L4Nrpnd5M4yuSrYJBKVZuX',
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Convert UIMessage format (parts array) to CoreMessage format (content string)
    const convertedMessages = messages.map((msg: { role: string; parts?: { type: string; text: string }[]; content?: string }) => ({
      role: msg.role,
      content: msg.parts
        ? msg.parts.filter((p: { type: string }) => p.type === 'text').map((p: { text: string }) => p.text).join('')
        : msg.content || ''
    }))

    const result = streamText({
      model: fireworks('accounts/fireworks/models/kimi-k2-instruct-0905'),
      system: 'You are a helpful, friendly AI assistant. You provide clear, concise, and accurate responses. You are knowledgeable across many topics and always aim to be helpful while being honest about your limitations.',
      messages: convertedMessages,
      maxTokens: 32768,
      temperature: 0.6,
      topP: 1,
      topK: 40,
      presencePenalty: 0,
      frequencyPenalty: 0,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get response from AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
