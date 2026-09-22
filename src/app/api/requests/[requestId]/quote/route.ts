import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { requestId } = await params
    const req = await prisma.printRequest.findUnique({ where: { id: requestId } })
    if (!req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }
    if (req.makerId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    if (req.status !== 'PENDING') {
      return NextResponse.json({ error: 'Statut invalide pour envoyer un devis' }, { status: 400 })
    }

    const body = await request.json()
    const { quotedPrice } = body
    if (!quotedPrice || isNaN(parseFloat(quotedPrice))) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
    }

    const updated = await prisma.printRequest.update({
      where: { id: requestId },
      data: {
        quotedPrice: parseFloat(quotedPrice),
        status: 'QUOTED',
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
