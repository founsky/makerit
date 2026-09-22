import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  role: string
  name: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'makerit-super-secret-key-32-chars!!',
  cookieName: process.env.SESSION_NAME ?? 'makerit_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
