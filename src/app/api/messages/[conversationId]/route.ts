import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { conversationId } = await params

    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } })
    if (!conv) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
    }
    if (conv.participantAId !== session.userId && conv.participantBId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { conversationId } = await params

    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } })
    if (!conv) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
    }
    if (conv.participantAId !== session.userId && conv.participantBId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { body: messageBody } = body

    if (!messageBody?.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: session.userId,
          body: messageBody.trim(),
        },
        include: { sender: { select: { id: true, name: true } } },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ])

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
