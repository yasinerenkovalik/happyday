// Panel form ve buton sınıfları (Davetly tasarım token'larıyla)
export const inputClass =
  'w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-body-md text-primary outline-none ring-1 ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-secondary'

export const buttonClass = {
  primary: 'inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60',
  secondary: 'inline-flex items-center justify-center gap-1.5 rounded-full bg-surface-container px-4 py-2 text-label-md text-primary transition-colors hover:bg-surface-container-high disabled:opacity-60',
  danger: 'inline-flex items-center justify-center gap-1.5 rounded-full bg-error-container px-4 py-2 text-label-md text-on-error-container transition-opacity hover:opacity-90 disabled:opacity-60',
}
