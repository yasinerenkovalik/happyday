import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { buttonClass, inputClass } from '../panel/styles'
import { Field, Notice } from '../panel/ui'

export function AdminLoginPage() {
  const { session, loginAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session?.role === 'Admin') return <Navigate to={from} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await loginAdmin(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Yönetici girişi" description="Firma onayları, kullanıcılar ve gelen mesajlar.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {session?.role === 'Company' && <Notice tone="info">Şu an bir firma hesabıyla giriş yapılmış; yönetici olarak girerseniz o oturum kapanır.</Notice>}
        <Field label="E-posta">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Şifre">
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        <button type="submit" disabled={submitting} className={`${buttonClass.primary} w-full py-3`}>
          {submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>
    </AuthLayout>
  )
}
