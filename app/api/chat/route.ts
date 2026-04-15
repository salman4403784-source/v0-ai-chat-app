export const maxDuration = 60

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Convert UI messages to API format
    const apiMessages: Message[] = messages.map((msg: { role: string; parts?: { type: string; text: string }[]; content?: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.parts 
        ? msg.parts.filter((p: { type: string }) => p.type === 'text').map((p: { text: string }) => p.text).join('') 
        : msg.content || ''
    }))

    const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/kimi-k2-instruct-0905",
        max_tokens: 32768,
        top_p: 1,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 0,
        temperature: 0.6,
        stream: true,
        messages: [
          {
            role: "system",
            content: "You are a helpful, friendly AI assistant. You provide clear, concise, and accurate responses. You are knowledgeable across many topics and always aim to be helpful while being honest about your limitations."
          },
          ...apiMessages
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] Fireworks API error:', errorText)
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (trimmed.startsWith('data:')) {
                const data = trimmed.slice(5).trim()
                if (data === '[DONE]') {
                  // Send finish message
                  controller.enqueue(encoder.encode(`data: {"type":"finish","finishReason":"stop"}\n\n`))
                  continue
                }
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    // Send as UI message stream format
                    controller.enqueue(encoder.encode(`data: {"type":"text-delta","delta":"${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}\n\n`))
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get response from AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
