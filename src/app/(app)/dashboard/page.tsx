import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      models: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  })
  if (!user) redirect('/login')

  if (user.role === 'MAKER') {
    const pendingRequests = await prisma.printRequest.count({
      where: { makerId: user.id, status: 'PENDING' },
    })
    const recentRequests = await prisma.printRequest.findMany({
      where: { makerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { client: true, model: true },
    })
    const totalModels = await prisma.model.count({ where: { makerId: user.id } })
    const completedCount = await prisma.printRequest.count({
      where: { makerId: user.id, status: 'COMPLETED' },
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Bienvenue, {user.name} !</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Demandes en attente', value: pendingRequests, color: 'yellow', icon: '⏳' },
            { label: 'Revenus totaux', value: formatPrice(user.totalEarnings), color: 'green', icon: '💰' },
            { label: 'Mes modèles', value: totalModels, color: 'indigo', icon: '🖨️' },
            { label: 'Commandes terminées', value: completedCount, color: 'purple', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent requests */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Dernières demandes</h2>
              <Link href="/requests" className="text-indigo-600 text-sm hover:underline">Voir tout</Link>
            </div>
            {recentRequests.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucune demande pour le moment</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className="flex items-center justify-between py-2 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {req.model?.title ?? 'Fichier personnalisé'}
                      </div>
                      <div className="text-xs text-slate-400">{req.client.name} · {formatDate(req.createdAt)}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My models */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Mes modèles récents</h2>
              <Link href="/models/new" className="text-indigo-600 text-sm hover:underline">+ Ajouter</Link>
            </div>
            {user.models.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-3">Vous n&apos;avez pas encore de modèle</p>
                <Link
                  href="/models/new"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                >
                  Ajouter un modèle
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {user.models.map((model) => (
                  <Link
                    key={model.id}
                    href={`/marketplace/${model.id}`}
                    className="flex items-center gap-3 py-2 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{model.title}</div>
                      <div className="text-xs text-slate-400">
                        {model.downloadCount} téléchargements
                        {model.priceEstimate ? ` · ${formatPrice(model.priceEstimate)}` : ''}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // CLIENT dashboard
  const activeRequests = await prisma.printRequest.count({
    where: {
      clientId: user.id,
      status: { in: ['PENDING', 'QUOTED', 'ACCEPTED', 'PRINTING', 'SHIPPED'] },
    },
  })
  const recentRequests = await prisma.printRequest.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { maker: true, model: true },
  })
  const completedCount = await prisma.printRequest.count({
    where: { clientId: user.id, status: 'COMPLETED' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Bienvenue, {user.name} !</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Commandes actives', value: activeRequests, icon: '📦' },
          { label: 'Commandes terminées', value: completedCount, icon: '✅' },
          { label: 'Total commandes', value: recentRequests.length, icon: '🗂️' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-900">Mes demandes récentes</h2>
          <div className="flex gap-3">
            <Link href="/requests/new" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
              Nouvelle demande
            </Link>
            <Link href="/requests" className="text-indigo-600 text-sm hover:underline self-center">Voir tout</Link>
          </div>
        </div>
        {recentRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm mb-3">Vous n&apos;avez pas encore de demandes</p>
            <Link
              href="/requests/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Faire une demande
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="flex items-center justify-between py-2 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {req.model?.title ?? 'Fichier personnalisé'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {req.maker.name} · {formatDate(req.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {req.quotedPrice && (
                    <span className="text-sm font-medium text-slate-700">{formatPrice(req.quotedPrice)}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
