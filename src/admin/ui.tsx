import { useEffect, useState } from 'react'
import { ADMIN_PAGE_SIZE } from '../api/admin'
import { Icon } from '../components/Icon'
import { buttonClass, inputClass } from '../panel/styles'

/** Yazmayı bıraktıktan kısa süre sonra değeri bildirir; her tuşta istek atılmasın */
export function SearchBox({ placeholder, onSearch }: { placeholder: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState('')
  useEffect(() => {
    const timer = window.setTimeout(() => onSearch(value.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [value, onSearch])

  return (
    <label className="relative block w-full sm:max-w-xs">
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lg text-on-surface-variant" />
      <input type="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
        aria-label={placeholder} className={`${inputClass} pl-10`} />
    </label>
  )
}

/** Uçlar toplam sayı döndürmediği için: tam sayfa geldiyse bir sonraki sayfa olabilir */
export function Pager({ page, count, onPage }: { page: number; count: number; onPage: (page: number) => void }) {
  if (page === 1 && count < ADMIN_PAGE_SIZE) return null
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className={buttonClass.secondary}>
        <Icon name="chevron_left" className="text-base" /> Önceki
      </button>
      <span className="text-label-md text-on-surface-variant">Sayfa {page}</span>
      <button type="button" disabled={count < ADMIN_PAGE_SIZE} onClick={() => onPage(page + 1)} className={buttonClass.secondary}>
        Sonraki <Icon name="chevron_right" className="text-base" />
      </button>
    </div>
  )
}

export function Badge({ tone, icon, children }: { tone: 'ok' | 'wait' | 'off'; icon: string; children: string }) {
  const styles = {
    ok: 'bg-secondary-fixed text-on-secondary-fixed',
    wait: 'bg-surface-container-high text-on-surface-variant',
    off: 'bg-error-container text-on-error-container',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm ${styles[tone]}`}>
      <Icon name={icon} className="text-sm" />
      {children}
    </span>
  )
}
