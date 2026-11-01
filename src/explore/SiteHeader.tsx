import { useState } from 'react'
import { Link } from 'react-router'
import { useCategories, useCities } from '../api/queries'
import { useAuth } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import { Popover, PopoverOption } from '../components/Popover'
import { AccountMenu } from './AccountMenu'
import { categoryIcon } from './categoryIcons'
import type { ExploreFilters } from './useExploreFilters'

type Props = {
  filters: ExploreFilters
  onChange: (patch: Partial<ExploreFilters>) => void
}

export function SiteHeader({ filters, onChange }: Props) {
  const { session } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-bright/90 shadow-[0_1px_12px_rgba(30,34,41,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-12">
        <Link to="/" className="flex items-center gap-2" aria-label="Davetly ana sayfa">
          <Icon name="diamond" className="text-2xl text-secondary" />
          <span className="text-headline-sm tracking-tight text-primary">davetly</span>
        </Link>

        <SearchPill filters={filters} onChange={onChange} className="hidden md:flex" />

        <nav className="flex items-center gap-2">
          <Link
            to={session?.companyId ? '/panel/mekanlar/yeni' : '/kayit'}
            className="hidden rounded-full px-4 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface lg:block"
          >
            Mekanını Listele
          </Link>
          <AccountMenu />
        </nav>
      </div>

      {/* Mobilde arama kutusu ikinci satırda */}
      <div className="px-5 pb-3 md:hidden">
        <SearchPill filters={filters} onChange={onChange} className="flex w-full" />
      </div>

      <CategoryStrip activeId={filters.categoryId} onSelect={(categoryId) => onChange({ categoryId })} />
    </header>
  )
}

const GUEST_PRESETS = [50, 100, 200, 300, 500, 1000]

function SearchPill({ filters, onChange, className }: Props & { className: string }) {
  const cities = useCities()
  const categories = useCategories()
  const [cityQuery, setCityQuery] = useState('')

  const cityName = cities.data?.find((c) => c.id === filters.cityId)?.cityName
  const categoryName = categories.data?.find((c) => c.id === filters.categoryId)?.name
  const matchingCities = (cities.data ?? []).filter((c) =>
    c.cityName.toLocaleLowerCase('tr').includes(cityQuery.trim().toLocaleLowerCase('tr')),
  )

  const segment = 'block w-full min-w-0 px-3 py-1 text-left md:px-4'
  return (
    <div className={`items-center rounded-full bg-surface-container-lowest px-2 py-1 shadow-soft transition-shadow hover:shadow-soft-lg ${className}`}>
      <Popover
        className="min-w-0 flex-1 md:flex-none"
        panelClassName="w-72"
        trigger={({ toggle }) => (
          <button type="button" onClick={toggle} className={segment}>
            <span className="block truncate whitespace-nowrap text-label-md text-primary">
              {cityName ?? (
                <>
                  <span className="md:hidden">Şehir</span>
                  <span className="hidden md:inline">Herhangi Bir Şehir</span>
                </>
              )}
            </span>
            <span className="hidden truncate whitespace-nowrap text-body-sm text-on-surface-variant md:block">{cityName ? 'Şehri değiştir' : 'İstanbul, İzmir...'}</span>
          </button>
        )}
      >
        {(close) => (
          <div>
            <input
              autoFocus
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Şehir ara"
              className="mb-2 w-full rounded-lg bg-surface-container-low px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-secondary"
            />
            <div className="max-h-72 overflow-y-auto">
              <PopoverOption selected={!filters.cityId} onSelect={() => { onChange({ cityId: undefined }); close() }}>
                Tüm şehirler
              </PopoverOption>
              {matchingCities.map((c) => (
                <PopoverOption key={c.id} selected={c.id === filters.cityId} onSelect={() => { onChange({ cityId: c.id }); setCityQuery(''); close() }}>
                  {c.cityName}
                </PopoverOption>
              ))}
            </div>
          </div>
        )}
      </Popover>

      <div className="h-6 w-px shrink-0 bg-surface-variant" />

      <Popover
        className="min-w-0 flex-1 md:flex-none"
        panelClassName="w-64"
        trigger={({ toggle }) => (
          <button type="button" onClick={toggle} className={segment}>
            <span className="block truncate whitespace-nowrap text-label-md text-primary">{categoryName ?? 'Mekan Türü'}</span>
            <span className="hidden truncate whitespace-nowrap text-body-sm text-on-surface-variant md:block">{categoryName ? 'Türü değiştir' : 'Kır bahçesi, otel...'}</span>
          </button>
        )}
      >
        {(close) => (
          <div className="max-h-80 overflow-y-auto">
            <PopoverOption selected={!filters.categoryId} onSelect={() => { onChange({ categoryId: undefined }); close() }}>
              Tüm türler
            </PopoverOption>
            {categories.data?.map((c) => (
              <PopoverOption key={c.id} selected={c.id === filters.categoryId} onSelect={() => { onChange({ categoryId: c.id }); close() }}>
                <span className="flex items-center gap-2">
                  <Icon name={categoryIcon(c.name)} className="text-lg text-on-surface-variant" />
                  {c.name}
                </span>
              </PopoverOption>
            ))}
          </div>
        )}
      </Popover>

      <div className="h-6 w-px shrink-0 bg-surface-variant" />

      <Popover
        className="min-w-0 flex-1 md:flex-none"
        align="right"
        panelClassName="w-64"
        trigger={({ toggle }) => (
          <button type="button" onClick={toggle} className={segment}>
            <span className="block truncate whitespace-nowrap text-label-md text-primary">
              {filters.minCapacity ? `${filters.minCapacity}+ kişi` : 'Kişi Sayısı'}
            </span>
            <span className="hidden truncate whitespace-nowrap text-body-sm text-on-surface-variant md:block">Davetli sayısı</span>
          </button>
        )}
      >
        {(close) => (
          <div>
            <p className="px-3 pt-1 pb-2 text-body-sm text-on-surface-variant">En az kaç kişilik mekan?</p>
            <PopoverOption selected={!filters.minCapacity} onSelect={() => { onChange({ minCapacity: undefined }); close() }}>
              Fark etmez
            </PopoverOption>
            {GUEST_PRESETS.map((n) => (
              <PopoverOption key={n} selected={filters.minCapacity === n} onSelect={() => { onChange({ minCapacity: n }); close() }}>
                {n}+ kişi
              </PopoverOption>
            ))}
          </div>
        )}
      </Popover>

      <span className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-sm">
        <Icon name="search" className="text-lg" />
      </span>
    </div>
  )
}

function CategoryStrip({ activeId, onSelect }: { activeId?: number; onSelect: (id: number | undefined) => void }) {
  const categories = useCategories()
  if (!categories.data?.length) return <div className="h-[66px]" />

  return (
    <div className="no-scrollbar w-full overflow-x-auto bg-surface-bright/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl min-w-max items-center justify-between gap-6 px-5 py-2 lg:px-12">
        {categories.data.map((c) => {
          const active = c.id === activeId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(active ? undefined : c.id)}
              aria-pressed={active}
              className={`group flex flex-col items-center gap-1 border-b-2 py-1 transition-colors ${
                active ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={categoryIcon(c.name)} className="text-xl transition-transform group-hover:scale-110" />
              <span className="text-label-sm whitespace-nowrap">{c.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
