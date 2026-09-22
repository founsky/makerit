import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function EarningsPage() {
  const session = await getSession()
  if (!session.userId || session.role !== 'MAKER') redirect('/dashboard')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { totalEarnings: true, name: true },
  })

  const payments = await prisma.payment.findMany({
    where: {
      request: { makerId: session.userId },
      status: 'paid',
    },
    include: {
      payer: { select: { name: true } },
      request: {
        include: { model: { select: { title: true } } },
      },
    },
    orderBy: { paidAt: 'desc' },
  })

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthlyEarnings = payments
    .filter((p) => p.paidAt && new Date(p.paidAt) >= thisMonth)
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mes gains</h1>
        <p className="text-slate-500 mt-1">Historique de vos revenus</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="text-sm text-slate-500 mb-1">Revenus totaux</div>
          <div className="text-3xl font-bold text-indigo-600">{formatPrice(user?.totalEarnings ?? 0)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="text-sm text-slate-500 mb-1">Ce mois-ci</div>
          <div className="text-3xl font-bold text-green-600">{formatPrice(monthlyEarnings)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="text-sm text-slate-500 mb-1">Transactions</div>
          <div className="text-3xl font-bold text-slate-900">{payments.length}</div>
        </div>
      </div>

      {/* Payment list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Historique des paiements</h2>
        </div>
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-slate-500">Aucun paiement reçu pour le moment</p>
            <p className="text-slate-400 text-sm mt-1">
              Complétez des commandes pour recevoir vos premiers gains
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Client</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3 hidden sm:table-cell">Modèle</th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase px-6 py-3">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {payment.paidAt ? formatDate(payment.paidAt) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {payment.payer.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                    {payment.request.model?.title ?? 'Fichier personnalisé'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-green-600">
                      +{formatPrice(payment.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
