import { useState, type FormEvent } from 'react'
import { useChangePassword } from '../api/account'
import { PASSWORD_HINT, passwordProblem } from '../lib/password'
import { buttonClass, inputClass } from './styles'
import { Field, Notice, Section } from './ui'

/** Firma bilgileri sayfasında; ana formdan ayrı kaydedilir */
export function ChangePasswordSection() {
  const change = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = passwordProblem(next, repeat)
    setFormError(problem)
    if (problem) return
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setCurrent('')
          setNext('')
          setRepeat('')
        },
      },
    )
  }

  const error = formError ?? change.error?.message
  return (
    <form onSubmit={handleSubmit}>
      <Section title="Şifre değiştir" description="Şifrenizi değiştirdiğinizde diğer cihazlardaki oturumlarınız kapanır.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Mevcut şifre" required>
            <input required type="password" autoComplete="current-password" value={current}
              onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Yeni şifre" required hint={PASSWORD_HINT}>
            <input required type="password" autoComplete="new-password" minLength={8} value={next}
              onChange={(e) => setNext(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Yeni şifre (tekrar)" required>
            <input required type="password" autoComplete="new-password" value={repeat}
              onChange={(e) => setRepeat(e.target.value)} className={inputClass} />
          </Field>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        {change.isSuccess && !error && <Notice tone="success">{change.data}</Notice>}
        <div className="flex justify-end">
          <button type="submit" disabled={change.isPending} className={buttonClass.secondary}>
            {change.isPending ? 'Değiştiriliyor…' : 'Şifreyi değiştir'}
          </button>
        </div>
      </Section>
    </form>
  )
}
