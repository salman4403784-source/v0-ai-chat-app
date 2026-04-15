import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Using Vercel AI Gateway - OpenAI models work zero-config
  const result = streamText({
    model: 'openai/gpt-4o-mini',
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
