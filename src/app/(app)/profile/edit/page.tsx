'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MATERIALS } from '@/lib/utils'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  bio: string | null
  city: string | null
  country: string | null
  printerBrand: string | null
  printerModel: string | null
  materials: string | null
  pricePerGram: number | null
  acceptsRequests: boolean
}

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    bio: '',
    city: '',
    country: '',
    printerBrand: '',
    printerModel: '',
    pricePerGram: '',
    acceptsRequests: true,
    role: 'CLIENT',
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(async (session) => {
        if (!session.userId) {
          router.push('/login')
          return
        }
        setUserId(session.userId)
        const res = await fetch(`/api/users/${session.userId}`)
        const user: UserData = await res.json()
        setForm({
          name: user.name ?? '',
          bio: user.bio ?? '',
          city: user.city ?? '',
          country: user.country ?? '',
          printerBrand: user.printerBrand ?? '',
          printerModel: user.printerModel ?? '',
          pricePerGram: user.pricePerGram?.toString() ?? '',
          acceptsRequests: user.acceptsRequests,
          role: user.role,
        })
        if (user.materials) {
          setSelectedMaterials(user.materials.split(',').map((m) => m.trim()).filter(Boolean))
        }
      })
  }, [router])

  function toggleMaterial(mat: string) {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) {
      toast.error('Le nom est obligatoire')
      return
    }
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        bio: form.bio || null,
        city: form.city || null,
        country: form.country || null,
      }
      if (form.role === 'MAKER') {
        body.printerBrand = form.printerBrand || null
        body.printerModel = form.printerModel || null
        body.materials = selectedMaterials.join(',') || null
        body.pricePerGram = form.pricePerGram ? parseFloat(form.pricePerGram) : null
        body.acceptsRequests = form.acceptsRequests
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
        return
      }
      toast.success('Profil mis à jour !')
      router.push('/profile')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Modifier mon profil</h1>
        <p className="text-slate-500 mt-1">Mettez à jour vos informations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General info */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Informations générales</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Présentez-vous..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pays</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="France"
              />
            </div>
          </div>
        </div>

        {/* Maker-specific */}
        {form.role === 'MAKER' && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Équipement d&apos;impression</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
                <input
                  type="text"
                  value={form.printerBrand}
                  onChange={(e) => setForm({ ...form, printerBrand: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bambu Lab"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                <input
                  type="text"
                  value={form.printerModel}
                  onChange={(e) => setForm({ ...form, printerModel: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="X1 Carbon"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Matériaux</label>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedMaterials.includes(mat)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix au gramme (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pricePerGram}
                onChange={(e) => setForm({ ...form, pricePerGram: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.05"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Accepte des demandes</div>
                <div className="text-xs text-slate-400">Permettre aux clients de vous contacter</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, acceptsRequests: !form.acceptsRequests })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.acceptsRequests ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.acceptsRequests ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
