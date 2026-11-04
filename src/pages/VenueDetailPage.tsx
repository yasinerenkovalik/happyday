import { lazy, Suspense, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useCategories, useEventTypes, useVenue, useVenuePackages } from '../api/queries'
import { RemoveVenueDialog } from '../admin/RemoveVenueDialog'
import { useAuth } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../explore/SiteFooter'
import { SiteHeader } from '../explore/SiteHeader'
import { categoryIcon } from '../explore/categoryIcons'
import { toSearchParams } from '../explore/useExploreFilters'
import { uploadUrl } from '../lib/api'
import { formatNumber } from '../lib/format'
import { absoluteUrl, SITE_NAME, useSeo, venueDescription, venueJsonLd, venueTitle } from '../lib/seo'
import { Gallery } from '../venue/Gallery'
import { InquiryForm } from '../venue/InquiryForm'
import { PackageCards } from '../venue/PackageCards'
import { serviceIcon } from '../venue/serviceIcons'

const LocationMap = lazy(() => import('../venue/LocationMap').then((m) => ({ default: m.LocationMap })))

export function VenueDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const venue = useVenue(id)
  const packages = useVenuePackages(id)
  const categories = useCategories()
  const eventTypes = useEventTypes()
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const { session } = useAuth()
  const [removing, setRemoving] = useState(false)

  const v = venue.data
  const category = categories.data?.find((c) => c.id === v?.categoryId)
  // Sitedeki sırayla; useEventTypes yüklenmeden boş kalır, başlık yüklenince güncellenir
  const venueEvents = eventTypes.data?.filter((e) => v?.eventTypeIds?.includes(e.id)) ?? []
  const eventNames = venueEvents.map((e) => e.name)

  const photos = v ? [v.coverPhotoPath, ...v.images.map((i) => i.imageUrl)].filter(unique) : []
  const photoUrls = photos.map((p) => uploadUrl(p)).filter((u): u is string => !!u)
  useSeo(
    v
      ? {
          title: venueTitle(v, eventNames),
          description: venueDescription(v, category?.name, eventNames),
          path: `/mekan/${v.id}`,
          image: photoUrls[0] && absoluteUrl(photoUrls[0]),
          jsonLd: venueJsonLd(v, photoUrls),
        }
      : venue.error
        ? { title: `Mekan bulunamadı | ${SITE_NAME}`, noindex: true }
        : null,
  )

  const scrollToForm = () => document.getElementById('teklif')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const selectPackage = (packageId: string) => {
    setSelectedPackageId(packageId)
    scrollToForm()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader filters={{ page: 1 }} onChange={(patch) => navigate(`/?${toSearchParams(patch)}`)} />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-5 pt-6 pb-24 lg:px-12 lg:pb-16">
        {session?.role === 'Admin' && v && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary px-4 py-3 text-body-sm text-on-primary">
            <Icon name="shield_person" className="text-lg" />
            <span className="flex-1">Yönetici olarak görüntülüyorsunuz. Uygunsuz bir şey varsa mekanı yayından kaldırabilirsiniz.</span>
            <button type="button" onClick={() => setRemoving(true)}
              className="rounded-full bg-error-container px-4 py-1.5 text-label-md text-on-error-container hover:opacity-90">
              Yayından kaldır
            </button>
          </div>
        )}
        {removing && v && (
          <RemoveVenueDialog
            venue={v}
            onCancel={() => setRemoving(false)}
            onDone={() => navigate('/admin/mekanlar?durum=kaldirilan', { replace: true })}
          />
        )}
        {venue.isPending ? (
          <DetailSkeleton />
        ) : venue.error || !v ? (
          <div className="rounded-2xl bg-surface-container-lowest p-10 text-center shadow-sm">
            <Icon name="location_off" className="text-5xl text-on-surface-variant" />
            <p className="mt-2 font-display text-headline-md text-primary">Mekan bulunamadı</p>
            <p className="text-body-sm text-on-surface-variant">{venue.error?.message ?? 'Bu mekan yayından kaldırılmış olabilir.'}</p>
            <Link to="/" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-label-md text-on-primary">Mekanlara dön</Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <nav aria-label="Konum" className="flex flex-wrap items-center gap-1 text-label-md text-on-surface-variant">
                <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
                <span className="text-outline-variant">/</span>
                <Link to={`/?${toSearchParams({ cityId: v.cityId })}`} className="hover:text-primary">{v.cityName}</Link>
                {category && (
                  <>
                    <span className="text-outline-variant">/</span>
                    <Link to={`/?${toSearchParams({ cityId: v.cityId, categoryId: category.id })}`} className="hover:text-primary">{category.name}</Link>
                  </>
                )}
                <span className="text-outline-variant">/</span>
                <span className="font-semibold text-primary">{v.title}</span>
              </nav>
              <ShareButton title={v.title} />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">{v.title}</h1>
              <div className="flex flex-wrap items-center gap-1.5 text-label-sm">
                {category && (
                  <Badge className="bg-primary text-on-primary" icon={categoryIcon(category.name)}>{category.name}</Badge>
                )}
                <Badge className="bg-secondary-fixed text-on-secondary-fixed" icon={v.isOutdoor ? 'deck' : 'meeting_room'}>
                  {v.isOutdoor ? 'Açık alan' : 'Kapalı alan'}
                </Badge>
                <span className="ml-2 inline-flex items-center gap-1 font-medium text-on-surface-variant">
                  <Icon name="location_on" className="text-sm text-secondary" />
                  {v.districtName}, {v.cityName}
                </span>
              </div>
              {venueEvents.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-label-sm">
                  <span className="mr-1 text-on-surface-variant">Uygun olduğu etkinlikler:</span>
                  {venueEvents.map((e) => (
                    <Link key={e.id} to={`/?${toSearchParams({ eventType: e.slug, cityId: v.cityId })}`}
                      className="rounded-full bg-surface-container-high px-3 py-1 text-on-surface transition-colors hover:bg-primary hover:text-on-primary">
                      {e.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Gallery title={v.title} images={photos} />

            <div className="grid grid-cols-1 items-start gap-6 pt-4 lg:grid-cols-12 lg:gap-10">
              <div className="space-y-10 lg:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                  <Spec icon="location_on" label="Konum" value={`${v.districtName}, ${v.cityName}`} />
                  <Spec icon="group" label="Kapasite" value={`${formatNumber(v.maxGuestCount)} kişi`} />
                  <Spec icon={v.isOutdoor ? 'deck' : 'meeting_room'} label="Alan" value={v.isOutdoor ? 'Açık alan' : 'Kapalı alan'} />
                  {v.duration && <Spec icon="schedule" label="Kullanım süresi" value={v.duration} />}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-low p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                      <Icon name="storefront" className="text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-title-md text-primary">Ev sahibi: {v.companyName}</h2>
                      <p className="text-body-sm text-on-surface-variant">{v.companyAddress}</p>
                    </div>
                  </div>
                  <button type="button" onClick={scrollToForm}
                    className="rounded-full bg-surface-container-lowest px-4 py-1.5 text-label-md whitespace-nowrap text-primary shadow-sm hover:bg-surface-container-high">
                    İletişime geç
                  </button>
                </div>

                <About text={v.description} />

                {packages.data && packages.data.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <p className="text-label-sm tracking-wider text-secondary uppercase">Fiyatlar</p>
                        <h2 className="font-display text-headline-md text-primary">Organizasyon Paketleri</h2>
                      </div>
                      <span className="text-body-sm text-on-surface-variant">Seçtiğiniz paket teklif formuna eklenir</span>
                    </div>
                    <PackageCards packages={packages.data} selectedId={selectedPackageId} onSelect={selectPackage} />
                  </section>
                )}

                {v.services.length > 0 && (
                  <Card title="Mekan Olanakları ve Hizmetleri">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                      {v.services.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <Icon name={serviceIcon(s)} className="text-2xl text-secondary" />
                          <span className="text-title-md text-on-surface">{s}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card
                  title="Konum"
                  action={
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-full bg-secondary-fixed px-3 py-1 text-label-sm text-on-secondary-fixed"
                    >
                      <Icon name="directions" className="text-sm" /> Yol tarifi al
                    </a>
                  }
                >
                  <p className="-mt-2 text-body-sm text-on-surface-variant">{v.adress || v.companyAddress}</p>
                  {(v.latitude !== 0 || v.longitude !== 0) && (
                    <div className="h-72 overflow-hidden rounded-xl bg-surface-container">
                      <Suspense fallback={<div className="h-full w-full animate-pulse bg-surface-container-high" />}>
                        <LocationMap latitude={v.latitude} longitude={v.longitude} title={v.title} />
                      </Suspense>
                    </div>
                  )}
                </Card>

                {(v.reservationNote || v.cancelPolicy) && (
                  <Card title="Rezervasyon ve İptal">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {v.reservationNote && <Policy icon="event_available" title="Rezervasyon" text={v.reservationNote} />}
                      {v.cancelPolicy && <Policy icon="event_busy" title="İptal koşulları" text={v.cancelPolicy} />}
                    </div>
                  </Card>
                )}
              </div>

              <aside id="teklif" className="scroll-mt-48 lg:sticky lg:top-44 lg:col-span-4">
                <InquiryForm
                  venue={v}
                  packages={packages.data ?? []}
                  selectedPackageId={selectedPackageId}
                  onSelectPackage={setSelectedPackageId}
                />
              </aside>
            </div>
          </>
        )}
      </main>

      <SiteFooter />

      {v && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 bg-surface-bright/95 px-5 py-3 shadow-[0_-4px_16px_rgba(30,34,41,0.08)] backdrop-blur-md lg:hidden">
          <span className="truncate text-title-md text-primary">{v.title}</span>
          <button type="button" onClick={scrollToForm} className="shrink-0 rounded-full bg-primary px-5 py-2 text-label-md text-on-primary">
            Teklif Al
          </button>
        </div>
      )}
    </div>
  )
}

const unique = (value: string | null, index: number, all: (string | null)[]): value is string =>
  !!value && all.indexOf(value) === index

function Badge({ icon, className, children }: { icon: string; className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${className}`}>
      <Icon name={icon} className="text-xs" />
      {children}
    </span>
  )
}

function Spec({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} className="text-2xl text-secondary" />
      <div>
        <p className="text-label-sm text-on-surface-variant uppercase">{label}</p>
        <p className="text-title-md text-primary">{value}</p>
      </div>
    </div>
  )
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-headline-sm text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Policy({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <Icon name={icon} className="text-2xl text-secondary" />
      <div>
        <h3 className="text-title-md text-primary">{title}</h3>
        <p className="text-body-sm text-on-surface-variant">{text}</p>
      </div>
    </div>
  )
}

/** Uzun açıklamada ilk paragraf görünür, gerisi "Devamını oku" ile açılır. */
function About({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  if (paragraphs.length === 0) return null
  const visible = expanded ? paragraphs : paragraphs.slice(0, 1)

  return (
    <Card title="Mekan Hakkında">
      <div className="space-y-2 text-body-md leading-relaxed text-on-surface-variant">
        {visible.map((p) => <p key={p}>{p}</p>)}
      </div>
      {paragraphs.length > 1 && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="text-label-md text-secondary hover:underline">
          {expanded ? 'Daha az göster' : 'Devamını oku'}
        </button>
      )}
    </Card>
  )
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {})
      return
    }
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={share}
      className="flex items-center gap-1 rounded-full bg-surface-container px-4 py-1.5 text-label-md text-primary hover:bg-surface-container-high">
      <Icon name={copied ? 'check' : 'share'} className="text-base" />
      {copied ? 'Bağlantı kopyalandı' : 'Paylaş'}
    </button>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-64 animate-pulse rounded bg-surface-container" />
      <div className="h-10 w-2/3 animate-pulse rounded bg-surface-container" />
      <div className="h-[420px] animate-pulse rounded-2xl bg-surface-container" />
    </div>
  )
}
