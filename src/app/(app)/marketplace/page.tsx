import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { CATEGORIES } from '@/lib/utils'

interface SearchParams {
  search?: string
  category?: string
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const category = params.category ?? ''

  const models = await prisma.model.findMany({
    where: {
      isPublic: true,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ],
      }),
      ...(category && { category }),
    },
    include: { maker: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
        <p className="text-slate-500 mt-1">Découvrez des milliers de modèles 3D prêts à imprimer</p>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Rechercher un modèle..."
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <select
          name="category"
          defaultValue={category}
          className="border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Rechercher
        </button>
        {(search || category) && (
          <Link
            href="/marketplace"
            className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium text-center"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="text-sm text-slate-500">
        {models.length} modèle{models.length !== 1 ? 's' : ''} trouvé{models.length !== 1 ? 's' : ''}
      </div>

      {/* Grid */}
      {models.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun modèle trouvé</h3>
          <p className="text-slate-500">Essayez d&apos;autres termes de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="h-44 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
                {model.thumbnailPath ? (
                  <img
                    src={model.thumbnailPath}
                    alt={model.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-indigo-300">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {model.category && (
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    {model.category}
                  </span>
                )}
                <h3 className="font-semibold text-slate-900 mt-2 truncate">{model.title}</h3>
                <p className="text-sm text-slate-500 mt-1 truncate">par {model.maker.name}</p>
                {model.maker.city && (
                  <p className="text-xs text-slate-400 mt-0.5">📍 {model.maker.city}</p>
                )}

                <div className="flex items-center justify-between mt-4">
                  {model.priceEstimate ? (
                    <span className="text-sm font-semibold text-slate-900">
                      à partir de {formatPrice(model.priceEstimate)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Prix sur devis</span>
                  )}
                  <Link
                    href={`/marketplace/${model.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Voir →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
