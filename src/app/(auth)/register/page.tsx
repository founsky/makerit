'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { MATERIALS } from '@/lib/utils'

const PRINTER_BRANDS = ['Bambu Lab', 'Creality', 'Prusa', 'Anycubic', 'Elegoo', 'Artillery', 'Raise3D', 'Ultimaker', 'Autre']

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password || password.length < 6) return 0
  let score = 1
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (score === 3 && /[^A-Za-z0-9]/.test(password)) score = 3
  return score as 0 | 1 | 2 | 3
}

const STRENGTH_LABELS = ['', 'Faible', 'Moyen', 'Fort']
const STRENGTH_COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-green-500']
const STRENGTH_TEXT_COLORS = ['', 'text-red-500', 'text-orange-500', 'text-green-600']

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
    confirmPassword: '',
    printerBrand: '',
    printerModel: '',
    pricePerGram: '',
    city: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle')
  const emailCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'MAKER' || roleParam === 'CLIENT') setRole(roleParam)
  }, [searchParams])

  function toggleMaterial(mat: string) {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    )
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setForm({ ...form, email: val })
    setFieldErrors((prev) => ({ ...prev, email: '' }))

    if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current)

    if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailStatus('checking')
      emailCheckTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(val)}`)
          const data = await res.json()
          setEmailStatus(data.exists ? 'exists' : 'available')
          if (data.exists) {
            setFieldErrors((prev) => ({ ...prev, email: 'Cet email est déjà utilisé' }))
          }
        } catch {
          setEmailStatus('idle')
        }
      }, 500)
    } else {
      setEmailStatus('idle')
    }
  }

  const passwordStrength = getPasswordStrength(form.password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Le nom est requis'
    if (!form.email) errors.email = "L'adresse e-mail est requise"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Adresse e-mail invalide'
    else if (emailStatus === 'exists') errors.email = 'Cet email est déjà utilisé'
    if (!form.password) errors.password = 'Le mot de passe est requis'
    else if (form.password.length < 6) errors.password = 'Minimum 6 caractères'
    if (!form.confirmPassword) errors.confirmPassword = 'Veuillez confirmer votre mot de passe'
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
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
        if (data.error === 'EMAIL_EXISTS') {
          setFieldErrors({ email: 'Cet email est déjà utilisé' })
        } else {
          toast.error(data.error || "Erreur lors de l'inscription")
        }
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Role selector — two big clickable cards */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Je suis...</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('MAKER')}
              className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                role === 'MAKER'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl block mb-1">🖨️</span>
              <span className="font-semibold">Maker</span>
              <div className="text-xs font-normal mt-0.5 opacity-75 leading-snug">J&apos;ai une imprimante 3D et je propose des impressions</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                role === 'CLIENT'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl block mb-1">📦</span>
              <span className="font-semibold">Client</span>
              <div className="text-xs font-normal mt-0.5 opacity-75 leading-snug">Je veux faire imprimer des pièces 3D</div>
            </button>
          </div>
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors((p) => ({ ...p, name: '' })) }}
            className={`w-full border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            placeholder="Jean Dupont"
            autoComplete="name"
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Adresse e-mail <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={form.email}
              onChange={handleEmailChange}
              className={`w-full border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-9 ${
                fieldErrors.email ? 'border-red-400 bg-red-50'
                : emailStatus === 'available' ? 'border-green-400'
                : 'border-slate-200'
              }`}
              placeholder="vous@exemple.fr"
              autoComplete="email"
            />
            {emailStatus === 'checking' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            )}
            {emailStatus === 'available' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
          {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
          {emailStatus === 'available' && !fieldErrors.email && (
            <p className="mt-1 text-xs text-green-600">Email disponible</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors((p) => ({ ...p, password: '' })) }}
            className={`w-full border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            placeholder="6 caractères minimum"
            autoComplete="new-password"
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
          {/* Password strength bar */}
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength >= level ? STRENGTH_COLORS[passwordStrength] : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${STRENGTH_TEXT_COLORS[passwordStrength]}`}>
                {STRENGTH_LABELS[passwordStrength]}
                {passwordStrength === 1 && ' — ajoutez des majuscules et chiffres'}
                {passwordStrength === 2 && ' — ajoutez des caractères spéciaux pour plus de sécurité'}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation mot de passe */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirmer le mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setFieldErrors((p) => ({ ...p, confirmPassword: '' })) }}
            className={`w-full border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              fieldErrors.confirmPassword ? 'border-red-400 bg-red-50'
              : form.confirmPassword && form.password === form.confirmPassword ? 'border-green-400'
              : 'border-slate-200'
            }`}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
          {!fieldErrors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
            <p className="mt-1 text-xs text-green-600">Les mots de passe correspondent</p>
          )}
        </div>

        {/* Ville */}
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

        {/* Maker-specific fields — animated slide-in */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            role === 'MAKER' ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors mt-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Création du compte...
            </>
          ) : (
            'Créer mon compte'
          )}
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
