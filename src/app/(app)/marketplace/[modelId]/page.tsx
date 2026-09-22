import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { formatPrice, formatDate } from '@/lib/utils'

const ModelViewer = dynamic(() => import('@/components/model-viewer'), {
  ssr: false,
  loading: () => (
    <div className="h-80 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  ),
})

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default async function ModelDetailPage({ params }: { params: Promise<{ modelId: string }> }) {
  const { modelId } = await params
  const session = await getSession()

  const model = await prisma.model.findUnique({
    where: { id: modelId },
    include: {
      maker: {
        include: {
          reviewsReceived: {
            include: { author: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      printRequests: {
        include: {
          review: { include: { author: true } },
        },
        where: { review: { isNot: null } },
        take: 5,
      },
    },
  })

  if (!model || !model.isPublic) notFound()

  const avgRating =
    model.maker.reviewsReceived.length > 0
      ? model.maker.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
        model.maker.reviewsReceived.length
      : 0

  const reviews = model.printRequests
    .filter((r) => r.review)
    .map((r) => r.review!)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/marketplace" className="hover:text-indigo-600">Marketplace</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{model.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: viewer + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3D Viewer */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            {model.filePath ? (
              <ModelViewer filePath={model.filePath} />
            ) : model.thumbnailPath ? (
              <img
                src={model.thumbnailPath}
                alt={model.title}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="h-80 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center text-indigo-300">
                  <svg className="w-20 h-20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-sm">Aucun aperçu disponible</p>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{model.title}</h1>
                {model.category && (
                  <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                    {model.category}
                  </span>
                )}
              </div>
              {model.priceEstimate && (
                <div className="text-right">
                  <div className="text-xs text-slate-400">À partir de</div>
                  <div className="text-2xl font-bold text-indigo-600">{formatPrice(model.priceEstimate)}</div>
                </div>
              )}
            </div>

            {model.description && (
              <p className="text-slate-600 leading-relaxed">{model.description}</p>
            )}

            {model.tags && (
              <div className="flex flex-wrap gap-2">
                {model.tags.split(',').map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 text-sm text-slate-400">
              <span>📥 {model.downloadCount} téléchargement{model.downloadCount !== 1 ? 's' : ''}</span>
              <span>📅 Publié le {formatDate(model.createdAt)}</span>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Avis clients ({reviews.length})</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {review.author.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{review.author.name}</span>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600">{review.comment}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatDate(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: maker card + actions */}
        <div className="space-y-4">
          {/* Maker card */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">À propos du maker</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                {model.maker.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{model.maker.name}</div>
                {model.maker.city && (
                  <div className="text-sm text-slate-500">📍 {model.maker.city}</div>
                )}
              </div>
            </div>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-sm text-slate-600">{avgRating.toFixed(1)}/5</span>
                <span className="text-xs text-slate-400">({model.maker.reviewsReceived.length} avis)</span>
              </div>
            )}

            {model.maker.printerBrand && (
              <div className="text-sm text-slate-600 mb-1">
                🖨️ {model.maker.printerBrand} {model.maker.printerModel}
              </div>
            )}
            {model.maker.materials && (
              <div className="text-sm text-slate-600 mb-1">
                🔧 {model.maker.materials}
              </div>
            )}
            {model.maker.pricePerGram && (
              <div className="text-sm text-slate-600 mb-4">
                💰 {formatPrice(model.maker.pricePerGram)}/g
              </div>
            )}

            <Link
              href={`/makers/${model.maker.id}`}
              className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors"
            >
              Voir le profil complet
            </Link>
          </div>

          {/* Action */}
          {session.userId && session.userId !== model.makerId && (
            <Link
              href={`/requests/new?modelId=${model.id}`}
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200"
            >
              Demander une impression
            </Link>
          )}

          {!session.userId && (
            <Link
              href="/login"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-semibold transition-colors"
            >
              Connexion pour commander
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
