import { useResendConfirmation } from '../api/account'
import { buttonClass } from '../panel/styles'

/** Doğrulama e-postasını yeniden gönderir; kayıt sonrası, giriş ve panel uyarısında kullanılır */
export function ResendVerification({ email, className = '' }: { email: string; className?: string }) {
  const resend = useResendConfirmation()

  if (resend.isSuccess) return <p className={`text-body-sm text-secondary ${className}`}>{resend.data}</p>

  return (
    <div className={className}>
      <button type="button" onClick={() => resend.mutate(email)} disabled={resend.isPending || !email} className={buttonClass.secondary}>
        {resend.isPending ? 'Gönderiliyor…' : 'Doğrulama e-postasını tekrar gönder'}
      </button>
      {resend.error && <p className="mt-2 text-body-sm text-error">{resend.error.message}</p>}
    </div>
  )
}
