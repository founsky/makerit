import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

async function getOrCreateConversation(userId: string, makerId: string) {
  const [a, b] = [userId, makerId].sort()
  let conv = await prisma.conversation.findUnique({
    where: { participantAId_participantBId: { participantAId: a, participantBId: b } },
  })
  if (!conv) {
    conv = await prisma.conversation.create({
      data: { participantAId: a, participantBId: b },
    })
  }
  return conv
}

export default async function MakerProfilePage({ params }: { params: Promise<{ makerId: string }> }) {
  const { makerId } = await params
  const session = await getSession()

  const maker = await prisma.user.findUnique({
    where: { id: makerId, role: 'MAKER' },
    include: {
      models: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
      },
      reviewsReceived: {
        include: { author: true, request: { include: { model: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!maker) notFound()

  const avgRating =
    maker.reviewsReceived.length > 0
      ? maker.reviewsReceived.reduce((s, r) => s + r.rating, 0) / maker.reviewsReceived.length
      : 0

  let conversationId: string | null = null
  if (session.userId && session.userId !== maker.id) {
    const conv = await getOrCreateConversation(session.userId, maker.id)
    conversationId = conv.id
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/makers" className="hover:text-indigo-600">Makers</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{maker.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-4xl flex-shrink-0">
            {maker.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{maker.name}</h1>
                {maker.city && (
                  <p className="text-slate-500 mt-1">📍 {maker.city}{maker.country ? `, ${maker.country}` : ''}</p>
                )}
              </div>
              {session.userId && session.userId !== maker.id && conversationId && (
                <Link
                  href={`/chat/${conversationId}`}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contacter
                </Link>
              )}
            </div>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-slate-700 font-medium">{avgRating.toFixed(1)}/5</span>
                <span className="text-slate-400 text-sm">({maker.reviewsReceived.length} avis)</span>
              </div>
            )}

            {maker.bio && (
              <p className="mt-4 text-slate-600 leading-relaxed">{maker.bio}</p>
            )}
          </div>
        </div>

        {/* Printer specs */}
        {(maker.printerBrand || maker.materials || maker.pricePerGram) && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(maker.printerBrand || maker.printerModel) && (
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium mb-1">Imprimante</div>
                <div className="text-sm font-medium text-slate-900">
                  {[maker.printerBrand, maker.printerModel].filter(Boolean).join(' ')}
                </div>
              </div>
            )}
            {maker.materials && (
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium mb-1">Matériaux</div>
                <div className="flex flex-wrap gap-1">
                  {maker.materials.split(',').map((m) => (
                    <span key={m} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      {m.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {maker.pricePerGram && (
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium mb-1">Tarif</div>
                <div className="text-sm font-medium text-slate-900">{formatPrice(maker.pricePerGram)}/g</div>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-400 uppercase font-medium mb-1">Modèles</div>
              <div className="text-sm font-medium text-slate-900">{maker.models.length} publié{maker.models.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        )}
      </div>

      {/* Models */}
      {maker.models.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Modèles publiés</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {maker.models.map((model) => (
              <Link
                key={model.id}
                href={`/marketplace/${model.id}`}
                className="group border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  {model.thumbnailPath ? (
                    <img
                      src={model.thumbnailPath}
                      alt={model.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-slate-900 truncate">{model.title}</h3>
                  {model.priceEstimate && (
                    <div className="text-sm text-indigo-600 font-medium mt-1">
                      {formatPrice(model.priceEstimate)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {maker.reviewsReceived.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Avis ({maker.reviewsReceived.length})
          </h2>
          <div className="space-y-4">
            {maker.reviewsReceived.map((review) => (
              <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">
                      {review.author.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900 text-sm">{review.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-slate-600 text-sm ml-10">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
