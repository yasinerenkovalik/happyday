import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { SITE_NAME, useSeo } from '../lib/seo'
import { Icon } from './Icon'

/** Giriş, kayıt ve şifre sayfalarının ortak çerçevesi: logo, kart ve ana sayfaya dönüş bağlantısı */
export function AuthLayout({
  title,
  description,
  wide = false,
  seoDescription,
  children,
}: {
  title: string
  description?: ReactNode
  wide?: boolean
  /** Verilirse sayfa aramada çıkar ve bu açıklamayı kullanır (kayıt sayfası); verilmezse aramada çıkmaz */
  seoDescription?: string
  children: ReactNode
}) {
  useSeo({ title: `${title} | ${SITE_NAME}`, description: seoDescription, noindex: !seoDescription })

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-surface px-4 py-10 sm:justify-center">
      <Link to="/" className="flex items-center gap-2">
        <Icon name="diamond" className="text-3xl text-secondary" />
        <span className="text-headline-sm tracking-tight text-primary">{SITE_NAME}</span>
      </Link>
      <div className={`w-full space-y-5 ${wide ? 'max-w-3xl' : 'max-w-sm rounded-2xl bg-surface-container-lowest p-8 shadow-xl'}`}>
        <div className={wide ? 'px-1' : ''}>
          <h1 className="font-display text-headline-md text-primary">{title}</h1>
          {description && <p className="mt-1 text-body-sm text-on-surface-variant">{description}</p>}
        </div>
        {children}
      </div>
      <Link to="/" className="text-label-md text-on-surface-variant hover:text-primary">← Mekanlara dön</Link>
    </main>
  )
}
