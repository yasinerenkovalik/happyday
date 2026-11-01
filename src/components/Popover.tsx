import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Tıklayınca açılan küçük panel. Dışarı tıklayınca veya Escape ile kapanır.
 * `children` bir fonksiyon olursa paneli kapatmak için `close` verilir.
 */
export function Popover({
  trigger,
  children,
  align = 'left',
  panelClassName = '',
  className = '',
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'left' | 'right'
  panelClassName?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          className={`absolute top-full z-50 mt-2 min-w-56 rounded-xl bg-surface-container-lowest p-2 shadow-soft-lg ring-1 ring-surface-variant ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}

/** Popover içindeki seçilebilir satır */
export function PopoverOption({
  selected,
  onSelect,
  children,
}: {
  selected: boolean
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-body-md hover:bg-surface-container ${
        selected ? 'font-semibold text-primary' : 'text-on-surface'
      }`}
    >
      {children}
      {selected && <span aria-hidden="true" className="material-symbols-outlined text-base text-secondary">check</span>}
    </button>
  )
}
