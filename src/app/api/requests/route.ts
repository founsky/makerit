import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const isMaker = session.role === 'MAKER'
    const requests = await prisma.printRequest.findMany({
      where: isMaker ? { makerId: session.userId } : { clientId: session.userId },
      include: {
        model: true,
        client: { select: { id: true, name: true } },
        maker: { select: { id: true, name: true } },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
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
    const { makerId, modelId, stlFilePath, color, material, quantity, notes } = body

    if (!makerId) {
      return NextResponse.json({ error: 'Maker requis' }, { status: 400 })
    }

    const maker = await prisma.user.findUnique({ where: { id: makerId, role: 'MAKER' } })
    if (!maker) {
      return NextResponse.json({ error: 'Maker non trouvé' }, { status: 404 })
    }

    const req = await prisma.printRequest.create({
      data: {
        clientId: session.userId,
        makerId,
        modelId: modelId ?? null,
        stlFilePath: stlFilePath ?? null,
        color: color ?? null,
        material: material ?? null,
        quantity: quantity ?? 1,
        notes: notes ?? null,
        status: 'PENDING',
      },
    })

    return NextResponse.json(req, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
