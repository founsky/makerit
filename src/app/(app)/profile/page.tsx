import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      models: { where: { isPublic: true }, orderBy: { createdAt: 'desc' }, take: 6 },
      reviewsReceived: { include: { author: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      _count: {
        select: {
          sentRequests: true,
          receivedRequests: true,
          models: true,
        },
      },
    },
  })
  if (!user) redirect('/login')

  const avgRating =
    user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((s, r) => s + r.rating, 0) / user.reviewsReceived.length
      : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>
        <Link
          href="/profile/edit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Modifier le profil
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'MAKER'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {user.role === 'MAKER' ? 'Maker' : 'Client'}
              </span>
            </div>
            {user.city && <p className="text-slate-500 mt-1">📍 {user.city}{user.country ? `, ${user.country}` : ''}</p>}
            <p className="text-slate-500 text-sm mt-0.5">✉️ {user.email}</p>
            {user.bio && <p className="text-slate-600 mt-3 leading-relaxed">{user.bio}</p>}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-lg ${s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                  ))}
                </div>
                <span className="text-slate-700 font-medium">{avgRating.toFixed(1)}/5</span>
                <span className="text-slate-400 text-sm">({user.reviewsReceived.length} avis)</span>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3">Membre depuis {formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {user.role === 'MAKER' ? (
          <>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{user._count.models}</div>
              <div className="text-xs text-slate-500 mt-1">Modèles</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{user._count.receivedRequests}</div>
              <div className="text-xs text-slate-500 mt-1">Demandes reçues</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{user.reviewsReceived.length}</div>
              <div className="text-xs text-slate-500 mt-1">Avis reçus</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-lg font-bold text-indigo-600">{formatPrice(user.totalEarnings)}</div>
              <div className="text-xs text-slate-500 mt-1">Revenus totaux</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{user._count.sentRequests}</div>
              <div className="text-xs text-slate-500 mt-1">Commandes passées</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{user.reviewsReceived.length}</div>
              <div className="text-xs text-slate-500 mt-1">Avis laissés</div>
            </div>
          </>
        )}
      </div>

      {/* Printer info (maker) */}
      {user.role === 'MAKER' && (user.printerBrand || user.materials || user.pricePerGram) && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Équipement</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {(user.printerBrand || user.printerModel) && (
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium mb-1">Imprimante</div>
                <div className="text-sm text-slate-900">
                  {[user.printerBrand, user.printerModel].filter(Boolean).join(' ')}
                </div>
              </div>
            )}
            {user.materials && (
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium mb-1">Matériaux</div>
                <div className="flex flex-wrap gap-1">
                  {user.materials.split(',').map((m) => (
                    <span key={m} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      {m.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {user.pricePerGram && (
              <div>
                <div className="text-xs text-slate-400 uppercase font-medium mb-1">Tarif</div>
                <div className="text-sm text-slate-900">{formatPrice(user.pricePerGram)}/g</div>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-400 uppercase font-medium mb-1">Accepte des demandes</div>
              <div className="text-sm text-slate-900">{user.acceptsRequests ? 'Oui' : 'Non'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Models (maker) */}
      {user.role === 'MAKER' && user.models.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900">Mes modèles</h2>
            <Link href="/models/new" className="text-indigo-600 text-sm hover:underline">+ Ajouter</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.models.map((model) => (
              <Link
                key={model.id}
                href={`/marketplace/${model.id}`}
                className="border border-slate-100 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-md mb-2 flex items-center justify-center">
                  {model.thumbnailPath ? (
                    <img src={model.thumbnailPath} alt={model.title} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className="text-sm font-medium text-slate-900 truncate">{model.title}</div>
                {model.priceEstimate && (
                  <div className="text-xs text-indigo-600 mt-0.5">{formatPrice(model.priceEstimate)}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {user.reviewsReceived.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Avis reçus</h2>
          <div className="space-y-3">
            {user.reviewsReceived.map((review) => (
              <div key={review.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{review.author.name}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
