import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MATERIALS } from '@/lib/utils'

interface SearchParams {
  material?: string
  city?: string
}

export default async function MakersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const materialFilter = params.material ?? ''
  const cityFilter = params.city ?? ''

  const makers = await prisma.user.findMany({
    where: {
      role: 'MAKER',
      acceptsRequests: true,
      ...(materialFilter && { materials: { contains: materialFilter } }),
      ...(cityFilter && { city: { contains: cityFilter } }),
    },
    include: {
      reviewsReceived: true,
      models: { where: { isPublic: true }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Makers</h1>
        <p className="text-slate-500 mt-1">Trouvez le maker idéal pour votre projet</p>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="city"
          defaultValue={cityFilter}
          placeholder="Rechercher par ville..."
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
        <select
          name="material"
          defaultValue={materialFilter}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Tous les matériaux</option>
          {MATERIALS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Filtrer
        </button>
        {(materialFilter || cityFilter) && (
          <Link
            href="/makers"
            className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium text-center"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="text-sm text-slate-500">
        {makers.length} maker{makers.length !== 1 ? 's' : ''} disponible{makers.length !== 1 ? 's' : ''}
      </div>

      {makers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun maker trouvé</h3>
          <p className="text-slate-500">Essayez d&apos;autres critères de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {makers.map((maker) => {
            const avgRating =
              maker.reviewsReceived.length > 0
                ? maker.reviewsReceived.reduce((s, r) => s + r.rating, 0) /
                  maker.reviewsReceived.length
                : 0

            return (
              <div
                key={maker.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">
                    {maker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{maker.name}</h3>
                    {maker.city && (
                      <p className="text-sm text-slate-500 mt-0.5">📍 {maker.city}</p>
                    )}
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3.5 h-3.5 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-slate-200'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">
                          {avgRating.toFixed(1)} ({maker.reviewsReceived.length})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {maker.bio && (
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2">{maker.bio}</p>
                )}

                <div className="mt-3 space-y-1">
                  {(maker.printerBrand || maker.printerModel) && (
                    <div className="text-xs text-slate-500">
                      🖨️ {[maker.printerBrand, maker.printerModel].filter(Boolean).join(' ')}
                    </div>
                  )}
                  {maker.materials && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {maker.materials.split(',').slice(0, 4).map((mat) => (
                        <span key={mat} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                          {mat.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {maker.pricePerGram && (
                    <div className="text-xs text-slate-500">
                      💰 {maker.pricePerGram.toFixed(2)} €/g
                    </div>
                  )}
                </div>

                <Link
                  href={`/makers/${maker.id}`}
                  className="mt-4 block w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Voir le profil
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
