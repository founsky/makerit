'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

interface RequestDetail {
  id: string
  status: string
  color: string | null
  material: string | null
  quantity: number
  notes: string | null
  quotedPrice: number | null
  finalPrice: number | null
  createdAt: string
  updatedAt: string
  clientId: string
  makerId: string
  model: { id: string; title: string } | null
  stlFilePath: string | null
  client: { id: string; name: string; email: string }
  maker: { id: string; name: string; city: string | null }
  payment: { status: string; amount: number } | null
  review: { rating: number; comment: string | null } | null
}

interface SessionUser {
  userId: string
  role: string
  name: string
}

const STATUS_STEPS = ['PENDING', 'QUOTED', 'ACCEPTED', 'PRINTING', 'SHIPPED', 'COMPLETED']

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status)
  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div className="flex items-center justify-center py-4">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-4">
      {STATUS_STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-1 flex-shrink-0">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                idx < currentIdx
                  ? 'bg-indigo-600 text-white'
                  : idx === currentIdx
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx < currentIdx ? '✓' : idx + 1}
            </div>
            <div className={`text-xs mt-1 font-medium ${idx <= currentIdx ? 'text-indigo-600' : 'text-slate-400'}`}>
              {STATUS_LABELS[step]}
            </div>
          </div>
          {idx < STATUS_STEPS.length - 1 && (
            <div className={`h-0.5 w-8 mb-5 ${idx < currentIdx ? 'bg-indigo-600' : 'bg-slate-100'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const router = useRouter()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [quotePrice, setQuotePrice] = useState('')
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setUser)
    fetch(`/api/requests/${requestId}`).then((r) => r.json()).then(setRequest)
  }, [requestId])

  async function patchStatus(status: string, extra?: Record<string, unknown>) {
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setRequest(data)
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  async function submitQuote() {
    if (!quotePrice || isNaN(parseFloat(quotePrice))) {
      toast.error('Veuillez entrer un prix valide')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotedPrice: parseFloat(quotePrice) }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setRequest(data)
      setShowQuoteForm(false)
      toast.success('Devis envoyé !')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  async function submitPayment() {
    if (!request?.quotedPrice) return
    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, amount: request.quotedPrice }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur paiement')
        return
      }
      setRequest((r) => r ? { ...r, status: 'COMPLETED', payment: data.payment } : r)
      toast.success('Paiement effectué et commande terminée !')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  async function submitReview() {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur avis')
        return
      }
      setRequest((r) => r ? { ...r, review: data } : r)
      setShowReviewForm(false)
      toast.success('Avis publié !')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  if (!request || !user) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const isMaker = user.userId === request.makerId
  const isClient = user.userId === request.clientId

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/requests" className="hover:text-indigo-600">Demandes</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate">
          {request.model?.title ?? 'Fichier personnalisé'}
        </span>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Suivi de la commande</h1>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[request.status]}`}>
            {STATUS_LABELS[request.status]}
          </span>
        </div>
        <StatusTimeline status={request.status} />
      </div>

      {/* Details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Détails de la demande</h2>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Modèle</dt>
              <dd className="font-medium text-slate-900">
                {request.model ? (
                  <Link href={`/marketplace/${request.model.id}`} className="text-indigo-600 hover:underline">
                    {request.model.title}
                  </Link>
                ) : 'Fichier personnalisé'}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Quantité</dt>
              <dd className="font-medium text-slate-900">{request.quantity}</dd>
            </div>
            {request.material && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Matériau</dt>
                <dd className="font-medium text-slate-900">{request.material}</dd>
              </div>
            )}
            {request.color && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Couleur</dt>
                <dd className="font-medium text-slate-900">{request.color}</dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Créée le</dt>
              <dd className="font-medium text-slate-900">{formatDate(request.createdAt)}</dd>
            </div>
            {request.quotedPrice && (
              <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                <dt className="text-slate-700 font-medium">Prix devisé</dt>
                <dd className="font-bold text-slate-900 text-base">{formatPrice(request.quotedPrice)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Participants</h2>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-400 uppercase font-medium mb-1">Client</div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">
                  {request.client.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-900">{request.client.name}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-medium mb-1">Maker</div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                  {request.maker.name.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-900">{request.maker.name}</span>
                  {request.maker.city && (
                    <div className="text-xs text-slate-400">📍 {request.maker.city}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {request.notes && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Notes et instructions</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{request.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Actions</h2>

        {/* MAKER + PENDING */}
        {isMaker && request.status === 'PENDING' && (
          <div className="space-y-3">
            {!showQuoteForm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Envoyer un devis
                </button>
                <button
                  onClick={() => patchStatus('REJECTED')}
                  disabled={loading}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Refuser
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Prix du devis (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="25.00"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={submitQuote}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Confirmer le devis
                  </button>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLIENT + QUOTED */}
        {isClient && request.status === 'QUOTED' && (
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-indigo-800">
                Le maker a envoyé un devis de{' '}
                <span className="font-bold text-lg">{formatPrice(request.quotedPrice!)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => patchStatus('ACCEPTED')}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Accepter le devis
              </button>
              <button
                onClick={() => patchStatus('CANCELLED')}
                disabled={loading}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* MAKER + ACCEPTED */}
        {isMaker && request.status === 'ACCEPTED' && (
          <button
            onClick={() => patchStatus('PRINTING')}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Marquer en cours d&apos;impression
          </button>
        )}

        {/* MAKER + PRINTING */}
        {isMaker && request.status === 'PRINTING' && (
          <button
            onClick={() => patchStatus('SHIPPED')}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Marquer comme expédié
          </button>
        )}

        {/* CLIENT + SHIPPED */}
        {isClient && request.status === 'SHIPPED' && (
          <div className="space-y-3">
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                Votre commande a été expédiée ! Confirmez la réception pour finaliser le paiement.
              </p>
            </div>
            <button
              onClick={submitPayment}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Confirmer la réception et payer {request.quotedPrice ? formatPrice(request.quotedPrice) : ''}
            </button>
          </div>
        )}

        {/* COMPLETED + no review */}
        {isClient && request.status === 'COMPLETED' && !request.review && (
          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">✅ Commande terminée !</p>
            </div>
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Laisser un avis
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl ${star <= reviewRating ? 'text-yellow-400' : 'text-slate-200'} hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Commentaire</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Votre avis sur cette impression..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={submitReview}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Publier l&apos;avis
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPLETED + review */}
        {request.status === 'COMPLETED' && request.review && (
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 mb-1">✅ Commande terminée</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= request.review!.rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>
              ))}
            </div>
            {request.review.comment && (
              <p className="text-sm text-green-700 mt-1">{request.review.comment}</p>
            )}
          </div>
        )}

        {/* No action needed */}
        {(request.status === 'CANCELLED' || request.status === 'REJECTED') && (
          <div className={`rounded-lg p-4 ${STATUS_COLORS[request.status]}`}>
            <p className="text-sm font-medium">
              {request.status === 'CANCELLED' ? 'Cette demande a été annulée.' : 'Cette demande a été refusée par le maker.'}
            </p>
          </div>
        )}
      </div>

      {/* Chat link */}
      <div className="text-center">
        <button
          onClick={async () => {
            const otherId = isMaker ? request.clientId : request.makerId
            const res = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ otherUserId: otherId }),
            })
            const data = await res.json()
            if (data.conversationId) {
              router.push(`/chat/${data.conversationId}`)
            }
          }}
          className="text-sm text-indigo-600 hover:underline"
        >
          Ouvrir la conversation avec {isMaker ? request.client.name : request.maker.name}
        </button>
      </div>
    </div>
  )
}
