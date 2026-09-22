import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const { modelId } = await params
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        maker: {
          select: { id: true, name: true, city: true, pricePerGram: true, materials: true, printerBrand: true, printerModel: true },
        },
        printRequests: {
          where: { review: { isNot: null } },
          include: { review: { include: { author: true } } },
          take: 5,
        },
      },
    })
    if (!model) {
      return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 })
    }
    return NextResponse.json(model)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { modelId } = await params
    const model = await prisma.model.findUnique({ where: { id: modelId } })
    if (!model) {
      return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 })
    }
    if (model.makerId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const updated = await prisma.model.update({
      where: { id: modelId },
      data: {
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        category: body.category ?? undefined,
        tags: body.tags ?? undefined,
        isPublic: body.isPublic ?? undefined,
        priceEstimate: body.priceEstimate ?? undefined,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { modelId } = await params
    const model = await prisma.model.findUnique({ where: { id: modelId } })
    if (!model) {
      return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 })
    }
    if (model.makerId !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    await prisma.model.delete({ where: { id: modelId } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
