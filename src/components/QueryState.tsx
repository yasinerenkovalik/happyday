import type { ReactNode } from 'react'

/** Liste sayfalarında ortak yükleniyor / hata / boş durumları. */
export function QueryState({
  isPending,
  error,
  isEmpty,
  emptyText,
  onRetry,
  children,
}: {
  isPending: boolean
  error: Error | null
  isEmpty: boolean
  emptyText: string
  onRetry: () => void
  children: ReactNode
}) {
  if (isPending) return <p className="py-12 text-center text-on-surface-variant">Yükleniyor…</p>
  if (error) {
    return (
      <div className="rounded-2xl bg-error-container p-6 text-center text-on-error-container">
        <p>{error.message}</p>
        <button type="button" onClick={onRetry} className="mt-3 text-label-md underline">Tekrar dene</button>
      </div>
    )
  }
  if (isEmpty) {
    return <p className="rounded-2xl border border-dashed border-outline-variant py-12 text-center text-on-surface-variant">{emptyText}</p>
  }
  return children
}
