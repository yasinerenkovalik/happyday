import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { ResendVerification } from '../components/ResendVerification'
import { ApiError } from '../lib/api'
import { buttonClass, inputClass } from '../panel/styles'
import { Field, Notice } from '../panel/ui'

export function LoginPage() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; notice?: string } | null
  const from = state?.from ?? '/panel'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session?.role === 'Company') return <Navigate to={from} replace />
  if (session?.role === 'Admin') return <Navigate to="/admin" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setUnverifiedEmail(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı.')
      // Şifre doğru ama e-posta doğrulanmamış: bağlantıyı yeniden isteyebilsin
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_CONFIRMED') setUnverifiedEmail(email.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Firma girişi" description="Mekanlarınızı, paketlerinizi ve gelen teklif taleplerini yönetin.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {state?.notice && <Notice tone="success">{state.notice}</Notice>}

        <Field label="E-posta">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Şifre">
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <div className="-mt-2 text-right">
          <Link to="/sifremi-unuttum" className="text-label-md text-secondary hover:underline">Şifremi unuttum</Link>
        </div>

        {error && <Notice tone="error">{error}</Notice>}
        {unverifiedEmail && <ResendVerification email={unverifiedEmail} />}

        <button type="submit" disabled={submitting} className={`${buttonClass.primary} w-full py-3`}>
          {submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
        <p className="text-center text-body-sm text-on-surface-variant">
          Hesabınız yok mu?{' '}
          <Link to="/kayit" className="text-label-md text-secondary hover:underline">Firmanızı kaydedin</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
