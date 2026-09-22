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
    const { requestId, rating, comment } = body

    if (!requestId || !rating) {
      return NextResponse.json({ error: 'requestId et rating requis' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 })
    }

    const req = await prisma.printRequest.findUnique({
      where: { id: requestId },
      include: { review: true },
    })

    if (!req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }
    if (req.clientId !== session.userId) {
      return NextResponse.json({ error: 'Seul le client peut laisser un avis' }, { status: 403 })
    }
    if (req.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'La commande doit être terminée pour laisser un avis' }, { status: 400 })
    }
    if (req.review) {
      return NextResponse.json({ error: 'Un avis a déjà été laissé pour cette commande' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        requestId,
        authorId: session.userId,
        subjectId: req.makerId,
        rating: parseInt(rating),
        comment: comment ?? null,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
