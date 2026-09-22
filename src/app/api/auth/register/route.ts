import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, city, printerBrand, printerModel, materials, pricePerGram } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    if (!['MAKER', 'CLIENT'].includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 409 })
    }

    const passwordHash = bcrypt.hashSync(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        city: city ?? null,
        printerBrand: role === 'MAKER' ? (printerBrand ?? null) : null,
        printerModel: role === 'MAKER' ? (printerModel ?? null) : null,
        materials: role === 'MAKER' ? (materials ?? null) : null,
        pricePerGram: role === 'MAKER' && pricePerGram ? parseFloat(pricePerGram) : null,
      },
    })

    const session = await getSession()
    session.userId = user.id
    session.role = user.role
    session.name = user.name
    await session.save()

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
