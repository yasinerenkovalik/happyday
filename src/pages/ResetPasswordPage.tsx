import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useResetPassword } from '../api/account'
import { AuthLayout } from '../components/AuthLayout'
import { PASSWORD_HINT, passwordProblem } from '../lib/password'
import { buttonClass, inputClass } from '../panel/styles'
import { Field, Notice } from '../panel/ui'

/** /auth/reset-password?cid=&token= — adres backend'in gönderdiği e-postadaki bağlantıyla aynı */
export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const companyId = params.get('cid')
  const token = params.get('token')
  const reset = useResetPassword()
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  if (!companyId || !token) {
    return (
      <AuthLayout title="Geçersiz bağlantı">
        <Notice tone="error">Bu şifre sıfırlama bağlantısı eksik ya da bozuk.</Notice>
        <Link to="/sifremi-unuttum" className={`${buttonClass.primary} w-full`}>Yeni bağlantı iste</Link>
      </AuthLayout>
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = passwordProblem(password, repeat)
    setFormError(problem)
    if (!problem) reset.mutate({ companyId: companyId!, token: token!, newPassword: password })
  }

  if (reset.isSuccess) {
    return (
      <AuthLayout title="Şifreniz güncellendi">
        <Notice tone="success">{reset.data || 'Şifreniz başarıyla güncellendi.'}</Notice>
        <Link to="/giris" className={`${buttonClass.primary} w-full py-3`}>Giriş yap</Link>
      </AuthLayout>
    )
  }

  const error = formError ?? reset.error?.message
  return (
    <AuthLayout title="Yeni şifre belirleyin">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Yeni şifre" hint={PASSWORD_HINT}>
          <input type="password" required autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Yeni şifre (tekrar)">
          <input type="password" required autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={inputClass} />
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        {reset.error && (
          <Link to="/sifremi-unuttum" className="block text-center text-label-md text-secondary hover:underline">Yeni bağlantı iste</Link>
        )}
        <button type="submit" disabled={reset.isPending} className={`${buttonClass.primary} w-full py-3`}>
          {reset.isPending ? 'Kaydediliyor…' : 'Şifremi güncelle'}
        </button>
      </form>
    </AuthLayout>
  )
}
