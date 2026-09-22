'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CATEGORIES } from '@/lib/utils'

export default function NewModelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stlFile, setStlFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    priceEstimate: '',
    isPublic: true,
  })
  const stlInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.stl') || file.name.endsWith('.STL'))) {
      setStlFile(file)
    } else {
      toast.error('Seuls les fichiers .STL sont acceptés')
    }
  }, [])

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error("Erreur lors de l'upload")
    const data = await res.json()
    return data.path
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) {
      toast.error('Le titre est obligatoire')
      return
    }
    if (!stlFile) {
      toast.error('Veuillez sélectionner un fichier STL')
      return
    }
    setLoading(true)
    try {
      const filePath = await uploadFile(stlFile)
      let thumbnailPath: string | undefined
      if (thumbnailFile) {
        thumbnailPath = await uploadFile(thumbnailFile)
      }

      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          tags: form.tags,
          priceEstimate: form.priceEstimate ? parseFloat(form.priceEstimate) : undefined,
          isPublic: form.isPublic,
          filePath,
          thumbnailPath,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la création')
        return
      }
      toast.success('Modèle publié avec succès !')
      router.push(`/marketplace/${data.id}`)
    } catch (err) {
      toast.error('Une erreur est survenue')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Publier un modèle</h1>
        <p className="text-slate-500 mt-1">Partagez vos créations avec la communauté</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STL Upload */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Fichier STL</h2>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => stlInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-indigo-400 bg-indigo-50'
                : stlFile
                ? 'border-green-300 bg-green-50'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            {stlFile ? (
              <>
                <div className="text-3xl mb-2">✅</div>
                <p className="font-medium text-slate-900">{stlFile.name}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {(stlFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setStlFile(null) }}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">📁</div>
                <p className="font-medium text-slate-700">
                  Glissez-déposez votre fichier STL
                </p>
                <p className="text-sm text-slate-400 mt-1">ou cliquez pour sélectionner</p>
                <p className="text-xs text-slate-300 mt-2">Fichiers .STL uniquement · Max 50MB</p>
              </>
            )}
          </div>
          <input
            ref={stlInputRef}
            type="file"
            accept=".stl,.STL"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setStlFile(file)
            }}
          />
        </div>

        {/* Infos */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Informations</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nom de votre modèle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Décrivez votre modèle, ses dimensions, son utilisation..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Sélectionner...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prix estimé (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.priceEstimate}
                onChange={(e) => setForm({ ...form, priceEstimate: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="5.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="figurine, décoration, fonctionnel (séparés par des virgules)"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Image de prévisualisation
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {thumbnailFile ? thumbnailFile.name : 'Choisir une image'}
              </button>
              {thumbnailFile && (
                <button
                  type="button"
                  onClick={() => setThumbnailFile(null)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              )}
            </div>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setThumbnailFile(file)
              }}
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-slate-700">Modèle public</div>
              <div className="text-xs text-slate-400">Visible dans le marketplace par tous</div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isPublic ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
            {loading ? 'Publication...' : 'Publier le modèle'}
          </button>
        </div>
      </form>
    </div>
  )
}
