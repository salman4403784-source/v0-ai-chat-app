import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Using Vercel AI Gateway with Fireworks - requires AI_GATEWAY_API_KEY or FIREWORKS_API_KEY
  const result = streamText({
    model: 'fireworks/accounts/fireworks/models/kimi-k2-instruct',
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
}
