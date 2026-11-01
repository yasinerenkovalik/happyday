import { Link } from 'react-router'
import { Icon } from '../components/Icon'

const YEAR = new Date().getFullYear()

export function SiteFooter() {
  return (
    <footer className="mt-10 w-full bg-surface-container-lowest shadow-[0_-1px_12px_rgba(30,34,41,0.04)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between lg:px-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="diamond" className="text-xl text-secondary" />
            <span className="text-headline-sm tracking-tight text-primary">davetly</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">Düğün, nişan ve davetler için mekanları tek yerde karşılaştırın.</p>
        </div>

        <div className="flex flex-col gap-3 text-body-sm md:items-end">
          <div className="flex gap-6">
            <Link to="/giris" className="font-semibold text-primary hover:underline">Mekanını Listele</Link>
            <Link to="/giris" className="text-on-surface-variant hover:text-on-surface hover:underline">Firma Girişi</Link>
          </div>
          <p className="text-on-surface-variant">© {YEAR} Davetly</p>
        </div>
      </div>
    </footer>
  )
}
