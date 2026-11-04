import { useEffect } from 'react'
import { CONTACT } from './contact'
import type { VenueDetail } from './types'

/**
 * Sayfa başlığı, açıklaması ve arama motoru etiketleri.
 *
 * Google sayfayı JavaScript'i çalıştırdıktan sonra okur, bu yüzden buradaki etiketleri görür.
 * WhatsApp/Instagram gibi önizleme botları JavaScript çalıştırmaz: mekan sayfalarında onlara
 * nginx, API'nin hazırladığı önizleme sayfasını verir (backend: SeoController, SeoText).
 * venueTitle/venueDescription backend'deki SeoText ile aynı metni üretir; biri değişirse öbürü de değişmeli.
 */

export const SITE_NAME = 'Mutlu Günüm'

// index.html'deki varsayılanlarla aynı (JavaScript'siz okuyanlar onları görür)
export const DEFAULT_TITLE = `${SITE_NAME} — Düğün, Nişan ve Davet Mekanları`
export const DEFAULT_DESCRIPTION =
  'Düğün, nişan, kına, söz ve doğum günü için mekanları keşfedin; fiyat, kapasite ve konuma göre karşılaştırıp ücretsiz teklif alın.'

export type Seo = {
  /** Tam sayfa başlığı; verilmezse varsayılan */
  title?: string
  description?: string
  /** Asıl adres (canonical); verilmezse bulunulan sayfanın yolu */
  path?: string
  image?: string
  /** Panel, giriş ve şifre sayfaları gibi aramada çıkmaması gerekenler */
  noindex?: boolean
  /** schema.org yapılandırılmış verisi (Google'ın mekanı tanıması için) */
  jsonLd?: object
}

const number = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 })

const place = (districtName: string, cityName: string) =>
  !districtName || districtName === cityName ? cityName : `${districtName}, ${cityName}`

/** Kelime ortasında kesmeden kısaltır */
export function truncate(text: string, max: number) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return (space > max / 2 ? cut.slice(0, space) : cut).replace(/[ ,.·]+$/, '') + '…'
}

/**
 * "Urla Bağ Evi — Urla, İzmir Düğün Mekanı | Mutlu Günüm": aramada eşleşsin diye ilk etkinlik başlıkta.
 * eventNames sitedeki sırayla (useEventTypes); mekan etkinlik seçmediyse "Urla Bağ Evi — Urla, İzmir | Mutlu Günüm".
 */
export function venueTitle(v: Pick<VenueDetail, 'title' | 'districtName' | 'cityName'>, eventNames: string[]) {
  const where = place(v.districtName, v.cityName)
  return eventNames.length > 0 ? `${v.title} — ${where} ${eventNames[0]} Mekanı | ${SITE_NAME}` : `${v.title} — ${where} | ${SITE_NAME}`
}

/** "Urla, İzmir · Kır Bahçesi · Düğün, Nişan, Kına Gecesi · 300 kişiye kadar · 72.000 ₺. Bağların…" (en fazla 160 karakter) */
export function venueDescription(v: VenueDetail, categoryName: string | undefined, eventNames: string[]) {
  const facts = [
    place(v.districtName, v.cityName),
    categoryName,
    eventNames.length > 0 ? eventNames.slice(0, 3).join(', ') : null,
    v.maxGuestCount > 0 ? `${number.format(v.maxGuestCount)} kişiye kadar` : null,
    v.price > 0 ? `${number.format(v.price)} ₺` : null,
  ].filter(Boolean).join(' · ')
  const text = v.description?.trim() ? `${facts}. ${v.description.split(/\s+/).filter(Boolean).join(' ')}` : facts
  return truncate(text, 160)
}

/** Göreli adresleri (geliştirmedeki /uploads/...) tam adrese çevirir; Google ve önizlemeler tam adres ister */
export const absoluteUrl = (url: string) => new URL(url, window.location.origin).href

/** Ana sayfa: Google'ın sitenin adını (arama sonucundaki "Mutlu Günüm") doğru göstermesi için */
export const siteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', name: SITE_NAME, alternateName: window.location.hostname, url: absoluteUrl('/') },
    {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
      logo: absoluteUrl('/favicon.svg'),
      email: CONTACT.email,
      telephone: CONTACT.phoneIntl,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: CONTACT.phoneIntl,
        email: CONTACT.email,
        areaServed: 'TR',
        availableLanguage: 'Turkish',
      },
    },
  ],
})

/** Mekan sayfası: adres, konum, kapasite ve fotoğraflarla etkinlik mekanı */
export function venueJsonLd(v: VenueDetail, imageUrls: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': ['EventVenue', 'LocalBusiness'],
    name: v.title,
    description: truncate(v.description ?? '', 500),
    url: absoluteUrl(`/mekan/${v.id}`),
    image: imageUrls.slice(0, 10).map(absoluteUrl),
    address: {
      '@type': 'PostalAddress',
      streetAddress: v.adress,
      addressLocality: v.districtName,
      addressRegion: v.cityName,
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: v.latitude, longitude: v.longitude },
    maximumAttendeeCapacity: v.maxGuestCount,
    ...(v.price > 0 && { priceRange: `${number.format(v.price)} ₺` }),
  }
}

function upsert(selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) {
  const el = document.head.querySelector<HTMLElement>(selector) ?? document.head.appendChild(create())
  set(el)
}

function setMeta(attr: 'name' | 'property', key: string, content: string | undefined) {
  const selector = `meta[${attr}="${key}"]`
  if (content === undefined) {
    document.head.querySelector(selector)?.remove()
    return
  }
  upsert(selector, () => document.createElement('meta'), (el) => {
    el.setAttribute(attr, key)
    el.setAttribute('content', content)
  })
}

function apply(seo: Seo) {
  const title = seo.title ?? DEFAULT_TITLE
  const description = seo.description ?? DEFAULT_DESCRIPTION
  const url = seo.noindex ? undefined : absoluteUrl(seo.path ?? window.location.pathname)

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', seo.noindex ? 'noindex' : undefined)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', seo.image)
  setMeta('name', 'twitter:card', seo.image ? 'summary_large_image' : 'summary')

  if (url) upsert('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), (el) => el.setAttribute('href', url))
  else document.head.querySelector('link[rel="canonical"]')?.remove()

  // Veri bloğu: tarayıcı çalıştırmaz, CSP'ye takılmaz
  if (seo.jsonLd) {
    upsert('script#seo-jsonld', () => Object.assign(document.createElement('script'), { id: 'seo-jsonld', type: 'application/ld+json' }), (el) => {
      el.textContent = JSON.stringify(seo.jsonLd)
    })
  } else document.head.querySelector('script#seo-jsonld')?.remove()
}

/**
 * Sayfanın SEO bilgilerini uygular. Her sayfa (ya da panel gibi ortak çerçevesi) çağırır; her çağrı bütün
 * etiketleri baştan yazar, önceki sayfadan kalan olmaz. Veri henüz yüklenmediyse null verin: bir şey değişmez.
 */
export function useSeo(seo: Seo | null) {
  const key = seo && JSON.stringify(seo)
  useEffect(() => {
    if (key) apply(JSON.parse(key) as Seo)
  }, [key])
}
