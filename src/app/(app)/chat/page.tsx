import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function ChatPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participantAId: session.userId },
        { participantBId: session.userId },
      ],
    },
    include: {
      participantA: true,
      participantB: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Vos conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun message</h3>
          <p className="text-slate-500">
            Contactez un maker pour commencer une conversation
          </p>
          <Link
            href="/makers"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Trouver un maker
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {conversations.map((conv) => {
            const other =
              conv.participantAId === session.userId ? conv.participantB : conv.participantA
            const lastMessage = conv.messages[0]
            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                  {other.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">{other.name}</span>
                    {lastMessage && (
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatDate(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {lastMessage ? (
                    <p className="text-sm text-slate-500 truncate mt-0.5">{lastMessage.body}</p>
                  ) : (
                    <p className="text-sm text-slate-300 mt-0.5 italic">Aucun message</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
