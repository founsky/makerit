import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const material = searchParams.get('material') ?? ''
    const city = searchParams.get('city') ?? ''

    const makers = await prisma.user.findMany({
      where: {
        role: 'MAKER',
        acceptsRequests: true,
        ...(material && { materials: { contains: material } }),
        ...(city && { city: { contains: city } }),
      },
      select: {
        id: true,
        name: true,
        city: true,
        bio: true,
        printerBrand: true,
        printerModel: true,
        materials: true,
        pricePerGram: true,
        acceptsRequests: true,
        reviewsReceived: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(makers)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
