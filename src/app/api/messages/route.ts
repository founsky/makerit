import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participantAId: session.userId },
          { participantBId: session.userId },
        ],
      },
      include: {
        participantA: { select: { id: true, name: true } },
        participantB: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { otherUserId } = body

    if (!otherUserId) {
      return NextResponse.json({ error: 'otherUserId requis' }, { status: 400 })
    }

    const [a, b] = [session.userId, otherUserId].sort()

    let conv = await prisma.conversation.findUnique({
      where: { participantAId_participantBId: { participantAId: a, participantBId: b } },
    })

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { participantAId: a, participantBId: b },
      })
    }

    return NextResponse.json({ conversationId: conv.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
