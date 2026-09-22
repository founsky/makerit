import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

export default async function RequestsPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const isMaker = session.role === 'MAKER'

  const requests = await prisma.printRequest.findMany({
    where: isMaker ? { makerId: session.userId } : { clientId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      model: true,
      client: true,
      maker: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isMaker ? 'Demandes reçues' : 'Mes demandes'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isMaker
              ? 'Gérez les demandes d\'impression de vos clients'
              : 'Suivez l\'avancement de vos commandes'}
          </p>
        </div>
        {!isMaker && (
          <Link
            href="/requests/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Nouvelle demande
          </Link>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune demande</h3>
          <p className="text-slate-500 mb-4">
            {isMaker
              ? "Vous n'avez pas encore de demandes d'impression"
              : "Vous n'avez pas encore passé de commande"}
          </p>
          {!isMaker && (
            <Link
              href="/requests/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Faire une demande
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Modèle</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3 hidden sm:table-cell">
                  {isMaker ? 'Client' : 'Maker'}
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3 hidden md:table-cell">Date</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3 hidden lg:table-cell">Prix</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Statut</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">
                      {req.model?.title ?? 'Fichier personnalisé'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {req.quantity}x · {req.material ?? 'Matériau non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">
                      {isMaker ? req.client.name : req.maker.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-500">{formatDate(req.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm font-medium text-slate-900">
                      {req.quotedPrice ? formatPrice(req.quotedPrice) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/requests/${req.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Détails →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
