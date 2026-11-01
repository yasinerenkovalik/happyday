import { Icon } from '../components/Icon'

/** 1 2 3 … 12 biçiminde sayfa numaraları */
function pageNumbers(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (['gap', p] as const) : [p]))
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages <= 1) return null

  const base = 'flex h-10 w-10 items-center justify-center rounded-full text-label-md shadow-sm transition-colors'
  return (
    <nav aria-label="Sayfalar" className="flex items-center justify-center gap-2 pt-4">
      <button
        type="button"
        aria-label="Önceki sayfa"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className={`${base} bg-surface-container-lowest text-on-surface hover:bg-surface-container-high disabled:opacity-40`}
      >
        <Icon name="chevron_left" className="text-lg" />
      </button>
      {pageNumbers(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-label-md text-on-surface-variant">…</span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPage(p)}
            className={`${base} ${p === page ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Sonraki sayfa"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className={`${base} bg-surface-container-lowest text-on-surface hover:bg-surface-container-high disabled:opacity-40`}
      >
        <Icon name="chevron_right" className="text-lg" />
      </button>
    </nav>
  )
}
