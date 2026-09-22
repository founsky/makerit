'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { MATERIALS } from '@/lib/utils'

interface Maker {
  id: string
  name: string
  city: string | null
  printerBrand: string | null
  printerModel: string | null
  materials: string | null
  pricePerGram: number | null
}

interface Model {
  id: string
  title: string
  maker: { id: string; name: string }
  priceEstimate: number | null
}

function NewRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modelIdParam = searchParams.get('modelId')
  const [loading, setLoading] = useState(false)
  const [makers, setMakers] = useState<Maker[]>([])
  const [model, setModel] = useState<Model | null>(null)
  const [stlFile, setStlFile] = useState<File | null>(null)
  const [makerSearch, setMakerSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const stlRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    makerId: '',
    makerName: '',
    color: '',
    material: '',
    quantity: '1',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/makers')
      .then((r) => r.json())
      .then((data) => setMakers(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (modelIdParam) {
      fetch(`/api/models/${modelIdParam}`)
        .then((r) => r.json())
        .then((data) => {
          setModel(data)
          if (data.maker?.id) {
            setForm((f) => ({ ...f, makerId: data.maker.id, makerName: data.maker.name }))
          }
        })
        .catch(console.error)
    }
  }, [modelIdParam])

  const filteredMakers = makers.filter(
    (m) =>
      m.name.toLowerCase().includes(makerSearch.toLowerCase()) ||
      (m.city ?? '').toLowerCase().includes(makerSearch.toLowerCase())
  )

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error("Erreur upload")
    const data = await res.json()
    return data.path
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.makerId) {
      toast.error('Veuillez sélectionner un maker')
      return
    }
    if (!modelIdParam && !stlFile) {
      toast.error('Veuillez fournir un fichier STL ou sélectionner un modèle')
      return
    }
    setLoading(true)
    try {
      let stlFilePath: string | undefined
      if (stlFile) {
        stlFilePath = await uploadFile(stlFile)
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makerId: form.makerId,
          modelId: modelIdParam ?? undefined,
          stlFilePath,
          color: form.color,
          material: form.material,
          quantity: parseInt(form.quantity),
          notes: form.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la demande')
        return
      }
      toast.success('Demande envoyée avec succès !')
      router.push(`/requests/${data.id}`)
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle demande d&apos;impression</h1>
        <p className="text-slate-500 mt-1">Décrivez votre projet à un maker</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Model info or STL upload */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Fichier à imprimer</h2>
          {model ? (
            <div className="flex items-center gap-4 bg-indigo-50 rounded-lg p-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-900">{model.title}</div>
                <div className="text-sm text-slate-500">par {model.maker.name}</div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 mb-3">Uploadez votre propre fichier STL :</p>
              <div
                onClick={() => stlRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  stlFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {stlFile ? (
                  <>
                    <p className="font-medium text-slate-900">{stlFile.name}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setStlFile(null) }}
                      className="mt-1 text-xs text-red-500 hover:underline"
                    >
                      Supprimer
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-sm text-slate-600">Cliquez pour sélectionner un fichier STL</p>
                  </>
                )}
              </div>
              <input
                ref={stlRef}
                type="file"
                accept=".stl,.STL"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setStlFile(file)
                }}
              />
            </div>
          )}
        </div>

        {/* Maker selector */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Choisir un maker</h2>
          <div className="relative">
            <input
              type="text"
              value={form.makerId ? form.makerName : makerSearch}
              onChange={(e) => {
                if (form.makerId) {
                  setForm({ ...form, makerId: '', makerName: '' })
                }
                setMakerSearch(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Rechercher un maker par nom ou ville..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              readOnly={!!form.makerId}
            />
            {form.makerId && (
              <button
                type="button"
                onClick={() => { setForm({ ...form, makerId: '', makerName: '' }); setMakerSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
            {showDropdown && !form.makerId && filteredMakers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredMakers.map((maker) => (
                  <button
                    key={maker.id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, makerId: maker.id, makerName: maker.name })
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-50 last:border-0"
                  >
                    <div className="font-medium text-slate-900">{maker.name}</div>
                    <div className="text-xs text-slate-400">
                      {maker.city && `📍 ${maker.city} · `}
                      {maker.materials ?? ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {form.makerId && (
            <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm font-medium text-indigo-900">✓ {form.makerName} sélectionné</p>
            </div>
          )}
        </div>

        {/* Print options */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Options d&apos;impression</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Couleur</label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Blanc, Noir, Rouge..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Matériau</label>
            <select
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Laissez choisir le maker</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes et instructions
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Précisions sur la qualité d'impression, remplissage, couleur exacte, délai souhaité..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
          >
            {loading ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewRequestPage() {
  return (
    <Suspense>
      <NewRequestForm />
    </Suspense>
  )
}
