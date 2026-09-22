'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function validateEmail(email: string): string | null {
  if (!email) return 'L\'adresse e-mail est requise'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Adresse e-mail invalide'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return 'Le mot de passe est requis'
  if (password.length < 6) return 'Le mot de passe doit faire au moins 6 caractères'
  return null
}

export default function LoginPage() {
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  function handleBlur(field: 'email' | 'password') {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === 'email') {
      const err = validateEmail(form.email)
      setFieldErrors((prev) => ({ ...prev, email: err ?? undefined }))
    } else {
      const err = validatePassword(form.password)
      setFieldErrors((prev) => ({ ...prev, password: err ?? undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const emailErr = validateEmail(form.email)
    const passwordErr = validatePassword(form.password)
    setTouched({ email: true, password: true })
    setFieldErrors({ email: emailErr ?? undefined, password: passwordErr ?? undefined })
    if (emailErr || passwordErr) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'INVALID_CREDENTIALS' || res.status === 401) {
          setFieldErrors({ password: 'Email ou mot de passe incorrect' })
        } else {
          toast.error(data.error || 'Erreur de connexion')
        }
        return
      }
      toast.success('Connexion réussie !')
      router.push('/dashboard')
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Connexion</h1>
      <p className="text-slate-500 text-sm mb-6">Bon retour parmi nous !</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Adresse e-mail
          </label>
          <input
            ref={emailRef}
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value })
              if (touched.email) {
                const err = validateEmail(e.target.value)
                setFieldErrors((prev) => ({ ...prev, email: err ?? undefined }))
              }
            }}
            onBlur={() => handleBlur('email')}
            className={`w-full border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              touched.email && fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
            }`}
            placeholder="vous@exemple.fr"
            autoComplete="email"
          />
          {touched.email && fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700">
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            type="password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value })
              if (touched.password) {
                const err = validatePassword(e.target.value)
                setFieldErrors((prev) => ({ ...prev, password: err ?? undefined }))
              }
            }}
            onBlur={() => handleBlur('password')}
            className={`w-full border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              touched.password && fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
            }`}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {touched.password && fieldErrors.password && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
          S&apos;inscrire
        </Link>
      </p>
    </>
  )
}
