import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({})
  }
  return NextResponse.json({
    userId: session.userId,
    role: session.role,
    name: session.name,
  })
}
