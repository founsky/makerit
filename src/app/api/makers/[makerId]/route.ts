import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ makerId: string }> }
) {
  try {
    const { makerId } = await params

    const maker = await prisma.user.findUnique({
      where: { id: makerId, role: 'MAKER' },
      select: {
        id: true,
        name: true,
        bio: true,
        city: true,
        country: true,
        printerBrand: true,
        printerModel: true,
        materials: true,
        pricePerGram: true,
        acceptsRequests: true,
        totalEarnings: true,
        createdAt: true,
        models: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!maker) {
      return NextResponse.json({ error: 'Maker non trouvé' }, { status: 404 })
    }

    return NextResponse.json(maker)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
