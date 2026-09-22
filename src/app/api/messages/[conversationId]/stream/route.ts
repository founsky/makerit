import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await getSession()
  if (!session.userId) return new Response('Unauthorized', { status: 401 })
  const { conversationId } = await params

  // Verify user is participant
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ participantAId: session.userId }, { participantBId: session.userId }] }
  })
  if (!conv) return new Response('Not found', { status: 404 })

  let lastMessageId: string | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial messages
      const messages = await prisma.message.findMany({
        where: { conversationId },
        include: { sender: { select: { id: true, name: true, avatarPath: true } } },
        orderBy: { createdAt: 'asc' },
        take: 50,
      })
      if (messages.length > 0) lastMessageId = messages[messages.length - 1].id
      send({ type: 'init', messages })

      // Poll DB every 1s and push new messages
      const interval = setInterval(async () => {
        try {
          const newMessages = await prisma.message.findMany({
            where: { conversationId, ...(lastMessageId ? { id: { gt: lastMessageId } } : {}) },
            include: { sender: { select: { id: true, name: true, avatarPath: true } } },
            orderBy: { createdAt: 'asc' },
          })
          if (newMessages.length > 0) {
            lastMessageId = newMessages[newMessages.length - 1].id
            send({ type: 'messages', messages: newMessages })
          }
        } catch {
          clearInterval(interval)
        }
      }, 1000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
