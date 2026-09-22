import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['QUOTED', 'REJECTED'],
  QUOTED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PRINTING', 'CANCELLED'],
  PRINTING: ['SHIPPED'],
  SHIPPED: ['COMPLETED'],
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { requestId } = await params
    const req = await prisma.printRequest.findUnique({
      where: { id: requestId },
      include: {
        model: true,
        client: { select: { id: true, name: true, email: true } },
        maker: { select: { id: true, name: true, city: true } },
        payment: true,
        review: true,
      },
    })
    if (!req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }
    if (req.clientId !== session.userId && req.makerId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    return NextResponse.json(req)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { requestId } = await params
    const req = await prisma.printRequest.findUnique({ where: { id: requestId } })
    if (!req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }
    if (req.clientId !== session.userId && req.makerId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (status) {
      const allowed = ALLOWED_TRANSITIONS[req.status] ?? []
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: `Transition de ${req.status} vers ${status} non autorisée` },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.printRequest.update({
      where: { id: requestId },
      data: {
        ...(status && { status }),
      },
      include: {
        model: true,
        client: { select: { id: true, name: true, email: true } },
        maker: { select: { id: true, name: true, city: true } },
        payment: true,
        review: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
