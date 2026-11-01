/** Google Material Symbols ikonu. İsimler: https://fonts.google.com/icons */
export function Icon({ name, filled = false, className = '' }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${filled ? 'icon-filled' : ''} ${className}`}>
      {name}
    </span>
  )
}
