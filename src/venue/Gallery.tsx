import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { uploadUrl } from '../lib/api'

/** Kapak + en fazla 4 küçük görselden oluşan bento galeri; tıklayınca tam ekran gösterici açılır. */
export function Gallery({ title, images }: { title: string; images: string[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
        <Icon name="image" className="text-5xl" />
      </div>
    )
  }

  const [hero, ...rest] = images
  const thumbs = rest.slice(0, 4)

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-md">
      <div className={`grid h-[320px] grid-cols-1 gap-2 md:h-[420px] lg:h-[500px] ${thumbs.length ? 'md:grid-cols-4' : ''}`}>
        <GalleryTile src={hero} alt={title} onClick={() => setOpenAt(0)} className={thumbs.length ? 'md:col-span-2' : ''} />
        {thumbs.length > 0 && (
          <div className={`hidden h-full gap-2 md:col-span-2 md:grid ${thumbs.length > 2 ? 'grid-cols-2 grid-rows-2' : 'grid-rows-2'}`}>
            {thumbs.map((src, i) => (
              <GalleryTile
                key={src + i}
                src={src}
                alt={`${title} fotoğraf ${i + 2}`}
                onClick={() => setOpenAt(i + 1)}
                className={thumbs.length === 3 && i === 0 ? 'col-span-2' : ''}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpenAt(0)}
        className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full bg-surface-bright/95 px-4 py-1.5 text-label-md text-primary shadow-lg backdrop-blur-md transition-transform active:scale-95"
      >
        <Icon name="photo_library" className="text-base" />
        Tüm {images.length} fotoğrafı gör
      </button>

      {openAt !== null && <Lightbox images={images} start={openAt} title={title} onClose={() => setOpenAt(null)} />}
    </div>
  )
}

function GalleryTile({ src, alt, onClick, className = '' }: { src: string; alt: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`group relative h-full overflow-hidden bg-surface-container ${className}`}>
      <img
        src={uploadUrl(src)}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </button>
  )
}

function Lightbox({ images, start, title, onClose }: { images: string[]; start: number; title: string; onClose: () => void }) {
  const [index, setIndex] = useState(start)
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + images.length) % images.length), [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [go, onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label={`${title} fotoğrafları`} className="fixed inset-0 z-[100] flex flex-col bg-primary/95">
      <div className="flex items-center justify-between px-5 py-4 text-on-primary">
        <span className="text-label-md">{index + 1} / {images.length}</span>
        <button type="button" onClick={onClose} aria-label="Kapat" className="rounded-full p-2 hover:bg-white/10">
          <Icon name="close" className="text-2xl" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        <img src={uploadUrl(images[index])} alt={`${title} fotoğraf ${index + 1}`} className="max-h-full max-w-full rounded-lg object-contain" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Önceki fotoğraf" className="absolute left-4 rounded-full bg-surface-bright/90 p-2 text-primary shadow-lg">
              <Icon name="chevron_left" className="text-2xl" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Sonraki fotoğraf" className="absolute right-4 rounded-full bg-surface-bright/90 p-2 text-primary shadow-lg">
              <Icon name="chevron_right" className="text-2xl" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
