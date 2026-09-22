import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return NextResponse.json({ exists: !!user })
}
