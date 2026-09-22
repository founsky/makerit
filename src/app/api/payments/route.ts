import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, amount } = body

    if (!requestId || !amount) {
      return NextResponse.json({ error: 'requestId et amount requis' }, { status: 400 })
    }

    const req = await prisma.printRequest.findUnique({ where: { id: requestId } })
    if (!req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }
    if (req.clientId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    if (req.status !== 'SHIPPED') {
      return NextResponse.json({ error: 'La commande doit être expédiée pour procéder au paiement' }, { status: 400 })
    }

    const existing = await prisma.payment.findUnique({ where: { requestId } })
    if (existing) {
      return NextResponse.json({ error: 'Paiement déjà effectué' }, { status: 409 })
    }

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          requestId,
          payerId: session.userId,
          amount: parseFloat(amount),
          currency: 'EUR',
          status: 'paid',
          paidAt: new Date(),
        },
      }),
      prisma.printRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED', finalPrice: parseFloat(amount) },
      }),
      prisma.user.update({
        where: { id: req.makerId },
        data: { totalEarnings: { increment: parseFloat(amount) } },
      }),
    ])

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
