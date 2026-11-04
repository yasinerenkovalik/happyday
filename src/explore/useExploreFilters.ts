import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { VenueFilters } from '../api/queries'

// Filtreler adres çubuğunda tutulur: paylaşılabilir link, geri tuşu ve yenileme çalışır.
// ?etkinlik=dugun&sehir=34&kategori=1&kisi=200&fiyat=100000&alan=acik&siralama=fiyat&sayfa=2
export type ExploreFilters = Omit<VenueFilters, 'page'> & { page: number }

/** Filtreleri ana sayfa adresine çevirir; detay sayfasındaki arama da bununla ana sayfaya gider. */
export function toSearchParams(f: Partial<ExploreFilters>) {
  const qs = new URLSearchParams()
  if (f.eventType) qs.set('etkinlik', f.eventType)
  if (f.cityId) qs.set('sehir', String(f.cityId))
  if (f.categoryId) qs.set('kategori', String(f.categoryId))
  if (f.minCapacity) qs.set('kisi', String(f.minCapacity))
  if (f.maxPrice) qs.set('fiyat', String(f.maxPrice))
  if (f.isOutdoor !== undefined) qs.set('alan', f.isOutdoor ? 'acik' : 'kapali')
  if (f.sortByPriceAsc) qs.set('siralama', 'fiyat')
  if (f.page && f.page > 1) qs.set('sayfa', String(f.page))
  return qs
}

const toInt = (v: string | null) => {
  const n = v ? Number.parseInt(v, 10) : NaN
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export function useExploreFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<ExploreFilters>(() => {
    const alan = params.get('alan')
    return {
      eventType: params.get('etkinlik')?.trim().toLowerCase() || undefined,
      cityId: toInt(params.get('sehir')),
      categoryId: toInt(params.get('kategori')),
      minCapacity: toInt(params.get('kisi')),
      maxPrice: toInt(params.get('fiyat')),
      isOutdoor: alan === 'acik' ? true : alan === 'kapali' ? false : undefined,
      sortByPriceAsc: params.get('siralama') === 'fiyat' || undefined,
      page: toInt(params.get('sayfa')) ?? 1,
    }
  }, [params])

  /** Filtre değişince ilk sayfaya dönülür; yalnızca sayfa değişiyorsa korunur. */
  const update = useCallback(
    (patch: Partial<ExploreFilters>) => {
      setParams(toSearchParams({ ...filters, page: 1, ...patch }), { preventScrollReset: patch.page === undefined })
    },
    [filters, setParams],
  )

  const clear = useCallback(() => setParams(new URLSearchParams()), [setParams])

  const activeCount = [filters.eventType, filters.minCapacity, filters.maxPrice, filters.isOutdoor].filter((v) => v !== undefined).length

  return { filters, update, clear, activeCount }
}
