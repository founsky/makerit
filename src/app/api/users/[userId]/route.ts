import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { userId } = await params
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { userId } = await params
    if (session.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      bio,
      city,
      country,
      printerBrand,
      printerModel,
      materials,
      pricePerGram,
      acceptsRequests,
    } = body

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(printerBrand !== undefined && { printerBrand }),
        ...(printerModel !== undefined && { printerModel }),
        ...(materials !== undefined && { materials }),
        ...(pricePerGram !== undefined && { pricePerGram }),
        ...(acceptsRequests !== undefined && { acceptsRequests }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        city: true,
        country: true,
        printerBrand: true,
        printerModel: true,
        materials: true,
        pricePerGram: true,
        acceptsRequests: true,
      },
    })

    // Update session name if changed
    if (name && name !== session.name) {
      const ironSession = await getSession()
      ironSession.name = name
      await ironSession.save()
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
