import { lazy, Suspense, useMemo, useState } from 'react'
import { useCategories, useCities, useVenueSearch } from '../api/queries'
import { Icon } from '../components/Icon'
import { Popover, PopoverOption } from '../components/Popover'
import { FilterBar, type ViewMode } from '../explore/FilterBar'
import { Pagination } from '../explore/Pagination'
import { SiteFooter } from '../explore/SiteFooter'
import { SiteHeader } from '../explore/SiteHeader'
import { useExploreFilters } from '../explore/useExploreFilters'
import { VenueCard, VenueCardSkeleton } from '../explore/VenueCard'
import { formatNumber } from '../lib/format'

// Leaflet büyük; harita ayrı parça olarak sonradan yüklenir
const VenueMap = lazy(() => import('../explore/VenueMap').then((m) => ({ default: m.VenueMap })))

export function ExplorePage() {
  const { filters, update, clear, activeCount } = useExploreFilters()
  const search = useVenueSearch(filters)
  const cities = useCities()
  const categories = useCategories()

  const [view, setView] = useState<ViewMode>('split')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)

  const categoryNames = useMemo(() => new Map(categories.data?.map((c) => [c.id, c.name])), [categories.data])
  const cityName = cities.data?.find((c) => c.id === filters.cityId)?.cityName
  const categoryName = filters.categoryId ? categoryNames.get(filters.categoryId) : undefined
  const venues = search.data?.items ?? []
  const total = search.data?.totalCount ?? 0

  const goToPage = (page: number) => {
    update({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const map = (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-surface-container-high" />}>
      <VenueMap venues={venues} activeId={activeId} onSelect={setActiveId} categoryNames={categoryNames} />
    </Suspense>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader filters={filters} onChange={update} />
      <FilterBar
        filters={filters}
        onChange={update}
        onClear={() => update({ minCapacity: undefined, maxPrice: undefined, isOutdoor: undefined })}
        activeCount={activeCount}
        view={view}
        onViewChange={setView}
      />

      <main className="mx-auto w-full max-w-[1720px] flex-1 px-5 pt-6 pb-10 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {view === 'split' && (
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-secondary" />
                    <span className="text-label-sm tracking-widest text-secondary uppercase">{categoryName ?? 'Tüm mekanlar'}</span>
                  </div>
                  <h1 className="font-display text-headline-md text-primary">
                    {cityName ?? 'Türkiye'} Genelinde Düğün &amp; Davet Mekanları
                  </h1>
                  <p className="mt-0.5 text-body-sm text-on-surface-variant">
                    {search.isPending ? 'Mekanlar yükleniyor…' : `${formatNumber(total)} mekan listeleniyor`}
                  </p>
                </div>
                <Popover
                  align="right"
                  trigger={({ toggle }) => (
                    <button type="button" onClick={toggle} className="flex items-center gap-1 text-label-md text-on-surface-variant">
                      Sıralama:
                      <span className="font-bold text-primary">{filters.sortByPriceAsc ? 'Fiyat (artan)' : 'En yeni'}</span>
                      <Icon name="unfold_more" className="text-sm text-primary" />
                    </button>
                  )}
                >
                  {(close) => (
                    <>
                      <PopoverOption selected={!filters.sortByPriceAsc} onSelect={() => { update({ sortByPriceAsc: undefined }); close() }}>
                        En yeni
                      </PopoverOption>
                      <PopoverOption selected={!!filters.sortByPriceAsc} onSelect={() => { update({ sortByPriceAsc: true }); close() }}>
                        Fiyat (düşükten yükseğe)
                      </PopoverOption>
                    </>
                  )}
                </Popover>
              </div>

              {search.error ? (
                <div className="rounded-xl bg-error-container p-6 text-center text-on-error-container">
                  <p>{search.error.message}</p>
                  <button type="button" onClick={() => search.refetch()} className="mt-2 text-label-md underline">Tekrar dene</button>
                </div>
              ) : search.isPending ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => <VenueCardSkeleton key={i} />)}
                </div>
              ) : venues.length === 0 ? (
                <div className="rounded-xl bg-surface-container-lowest p-10 text-center shadow-sm">
                  <Icon name="search_off" className="text-4xl text-on-surface-variant" />
                  <p className="mt-2 text-title-md text-primary">Bu filtrelere uygun mekan bulunamadı</p>
                  <p className="text-body-sm text-on-surface-variant">Şehri veya filtreleri değiştirmeyi deneyin.</p>
                  <button type="button" onClick={clear} className="mt-4 rounded-full bg-primary px-5 py-2 text-label-md text-on-primary">
                    Tüm filtreleri temizle
                  </button>
                </div>
              ) : (
                <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${search.isPlaceholderData ? 'opacity-60' : ''}`}>
                  {venues.map((v) => (
                    <VenueCard
                      key={v.id}
                      venue={v}
                      categoryName={categoryNames.get(v.categoryId)}
                      active={v.id === activeId}
                      onHover={setActiveId}
                    />
                  ))}
                </div>
              )}

              <Pagination page={filters.page} totalPages={search.data?.totalPages ?? 0} onPage={goToPage} />
            </div>
          )}

          <aside
            className={`hidden overflow-hidden rounded-2xl bg-surface-container-high shadow-xl lg:block ${
              view === 'split' ? 'sticky top-[10.5rem] h-[calc(100vh-12rem)] lg:col-span-5' : 'h-[calc(100vh-14rem)] lg:col-span-12'
            }`}
          >
            {map}
          </aside>
        </div>
      </main>

      <SiteFooter />

      {/* Mobil: liste ile harita arasında geçiş */}
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMapOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-on-primary shadow-2xl transition-transform active:scale-95"
        >
          <Icon name="map" className="text-lg" />
          <span className="text-label-md font-bold">Haritada Göster</span>
        </button>
      </div>
      {mobileMapOpen && (
        <div className="fixed inset-0 z-[60] bg-surface lg:hidden">
          {map}
          <button
            type="button"
            onClick={() => setMobileMapOpen(false)}
            className="absolute top-4 left-4 z-[600] flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-label-md text-on-primary shadow-xl"
          >
            <Icon name="view_list" className="text-base" /> Listeye dön
          </button>
        </div>
      )}
    </div>
  )
}
