import type { ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { Popover, PopoverOption } from '../components/Popover'
import { formatPrice } from '../lib/format'
import type { ExploreFilters } from './useExploreFilters'

export type ViewMode = 'split' | 'map'

const PRICE_OPTIONS = [50_000, 100_000, 150_000, 250_000, 500_000]
const CAPACITY_OPTIONS = [100, 200, 300, 500, 1000]

type Props = {
  filters: ExploreFilters
  onChange: (patch: Partial<ExploreFilters>) => void
  onClear: () => void
  activeCount: number
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function FilterBar({ filters, onChange, onClear, activeCount, view, onViewChange }: Props) {
  return (
    <section className="w-full bg-surface-bright/95 px-5 py-2 shadow-sm backdrop-blur-md lg:px-12">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
          <Popover
            trigger={({ toggle }) => (
              <FilterPill active={filters.maxPrice !== undefined} onClick={toggle}>
                {filters.maxPrice ? `${formatPrice(filters.maxPrice)} ve altı` : 'Fiyat Aralığı'}
              </FilterPill>
            )}
          >
            {(close) => (
              <>
                <PopoverOption selected={!filters.maxPrice} onSelect={() => { onChange({ maxPrice: undefined }); close() }}>
                  Fark etmez
                </PopoverOption>
                {PRICE_OPTIONS.map((p) => (
                  <PopoverOption key={p} selected={filters.maxPrice === p} onSelect={() => { onChange({ maxPrice: p }); close() }}>
                    {formatPrice(p)} ve altı
                  </PopoverOption>
                ))}
              </>
            )}
          </Popover>

          <Popover
            trigger={({ toggle }) => (
              <FilterPill active={filters.minCapacity !== undefined} onClick={toggle}>
                {filters.minCapacity ? `Kapasite ${filters.minCapacity}+` : 'Kapasite'}
              </FilterPill>
            )}
          >
            {(close) => (
              <>
                <PopoverOption selected={!filters.minCapacity} onSelect={() => { onChange({ minCapacity: undefined }); close() }}>
                  Fark etmez
                </PopoverOption>
                {CAPACITY_OPTIONS.map((c) => (
                  <PopoverOption key={c} selected={filters.minCapacity === c} onSelect={() => { onChange({ minCapacity: c }); close() }}>
                    En az {c} kişi
                  </PopoverOption>
                ))}
              </>
            )}
          </Popover>

          <Popover
            trigger={({ toggle }) => (
              <FilterPill active={filters.isOutdoor !== undefined} onClick={toggle}>
                {filters.isOutdoor === undefined ? 'Açık / Kapalı Alan' : filters.isOutdoor ? 'Açık Alan' : 'Kapalı Alan'}
              </FilterPill>
            )}
          >
            {(close) => (
              <>
                <PopoverOption selected={filters.isOutdoor === undefined} onSelect={() => { onChange({ isOutdoor: undefined }); close() }}>
                  Fark etmez
                </PopoverOption>
                <PopoverOption selected={filters.isOutdoor === true} onSelect={() => { onChange({ isOutdoor: true }); close() }}>
                  Açık alan
                </PopoverOption>
                <PopoverOption selected={filters.isOutdoor === false} onSelect={() => { onChange({ isOutdoor: false }); close() }}>
                  Kapalı alan
                </PopoverOption>
              </>
            )}
          </Popover>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex shrink-0 items-center gap-1 rounded-full bg-surface-container-high px-4 py-1.5 text-label-md text-primary transition-colors hover:bg-surface-container-highest"
            >
              <Icon name="close" className="text-base" />
              Temizle ({activeCount})
            </button>
          )}
        </div>

        <div className="hidden shrink-0 items-center rounded-full bg-surface-container-low p-1 shadow-inner lg:flex">
          <ViewToggle active={view === 'split'} onClick={() => onViewChange('split')} icon="view_list" label="Liste & Harita" />
          <ViewToggle active={view === 'map'} onClick={() => onViewChange('map')} icon="map" label="Yalnızca Harita" />
        </div>
      </div>
    </section>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-label-md whitespace-nowrap shadow-sm transition-all ${
        active ? 'bg-primary text-on-primary shadow-md hover:bg-primary-container' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
      }`}
    >
      {children}
      <Icon name="expand_more" className={`text-base ${active ? '' : 'text-on-surface-variant group-hover:text-primary'}`} />
    </button>
  )
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-label-md transition-colors ${
        active ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      <Icon name={icon} className="text-base" />
      {label}
    </button>
  )
}
