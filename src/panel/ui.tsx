import { useEffect, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { buttonClass } from './styles'

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-label-md text-on-surface">
        {label}
        {required && <span className="text-secondary"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-body-sm text-on-surface-variant">{hint}</span>}
    </label>
  )
}

export function Section({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-headline-sm text-primary">{title}</h2>
          {description && <p className="text-body-sm text-on-surface-variant">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-headline-md text-primary">{title}</h1>
        {description && <p className="text-body-sm text-on-surface-variant">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Notice({ tone, children }: { tone: 'success' | 'error' | 'info'; children: ReactNode }) {
  const styles = {
    success: 'bg-secondary-fixed/60 text-on-secondary-fixed',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-surface-container-high text-on-surface',
  }
  const icon = { success: 'check_circle', error: 'error', info: 'info' }
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-xl px-4 py-3 text-body-sm ${styles[tone]}`}>
      <Icon name={icon[tone]} className="text-lg" />
      <span>{children}</span>
    </p>
  )
}

/** Silme gibi geri alınamayan işlemler için onay penceresi */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  pending,
  pendingLabel = 'Siliniyor…',
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: {
  title: string
  message: ReactNode
  confirmLabel: string
  pending?: boolean
  pendingLabel?: string
  /** Ör. gerekli bir alan boşken onay düğmesi kapalı kalsın */
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <h2 id="confirm-title" className="text-headline-sm text-primary">{title}</h2>
        <div className="text-body-md text-on-surface-variant">{message}</div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonClass.secondary} autoFocus>Vazgeç</button>
          <button type="button" onClick={onConfirm} disabled={pending || confirmDisabled} className={buttonClass.danger}>
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
