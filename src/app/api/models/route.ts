import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const category = searchParams.get('category') ?? ''
    const makerId = searchParams.get('makerId') ?? ''

    const models = await prisma.model.findMany({
      where: {
        isPublic: true,
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { tags: { contains: search } },
          ],
        }),
        ...(category && { category }),
        ...(makerId && { makerId }),
      },
      include: {
        maker: {
          select: { id: true, name: true, city: true, pricePerGram: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(models)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.userId || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, tags, filePath, thumbnailPath, isPublic, priceEstimate } = body

    if (!title || !filePath) {
      return NextResponse.json({ error: 'Titre et fichier STL requis' }, { status: 400 })
    }

    const model = await prisma.model.create({
      data: {
        makerId: session.userId,
        title,
        description: description ?? null,
        category: category ?? null,
        tags: tags ?? null,
        filePath,
        thumbnailPath: thumbnailPath ?? null,
        isPublic: isPublic ?? true,
        priceEstimate: priceEstimate ?? null,
      },
    })

    return NextResponse.json(model, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
