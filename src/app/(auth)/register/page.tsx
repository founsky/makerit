'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { MATERIALS } from '@/lib/utils'
import { Suspense } from 'react'

const PRINTER_BRANDS = ['Bambu Lab', 'Creality', 'Prusa', 'Anycubic', 'Elegoo', 'Artillery', 'Raise3D', 'Ultimaker', 'Autre']

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'MAKER' | 'CLIENT'>('CLIENT')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    printerBrand: '',
    printerModel: '',
    pricePerGram: '',
    city: '',
  })

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'MAKER' || roleParam === 'CLIENT') {
      setRole(roleParam)
    }
  }, [searchParams])

  function toggleMaterial(mat: string) {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    setLoading(true)
    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        city: form.city,
        ...(role === 'MAKER' && {
          printerBrand: form.printerBrand,
          printerModel: form.printerModel,
          materials: selectedMaterials.join(','),
          pricePerGram: form.pricePerGram ? parseFloat(form.pricePerGram) : undefined,
        }),
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription")
        return
      }
      toast.success('Compte créé avec succès !')
      router.push('/dashboard')
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
      <p className="text-slate-500 text-sm mb-6">Rejoignez la communauté MakerIt</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Je suis...</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('MAKER')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                role === 'MAKER'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              🖨️ Maker
              <div className="text-xs font-normal mt-0.5 opacity-75">J&apos;ai une imprimante 3D</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                role === 'CLIENT'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              📦 Client
              <div className="text-xs font-normal mt-0.5 opacity-75">Je veux faire imprimer</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Adresse e-mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="vous@exemple.fr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="6 caractères minimum"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Paris"
          />
        </div>

        {/* Maker-specific fields */}
        {role === 'MAKER' && (
          <div className="bg-indigo-50 rounded-xl p-4 space-y-4 border border-indigo-100">
            <h3 className="font-semibold text-indigo-900 text-sm">Informations de votre imprimante</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marque de l&apos;imprimante</label>
              <select
                value={form.printerBrand}
                onChange={(e) => setForm({ ...form, printerBrand: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Sélectionner une marque</option>
                {PRINTER_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modèle d&apos;imprimante</label>
              <input
                type="text"
                value={form.printerModel}
                onChange={(e) => setForm({ ...form, printerModel: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="ex: Bambu Lab X1 Carbon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Matériaux disponibles</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prix au gramme (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pricePerGram}
                onChange={(e) => setForm({ ...form, pricePerGram: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="0.05"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors mt-2"
        >
          {loading ? 'Création du compte...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Se connecter
        </Link>
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
