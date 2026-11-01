import { useEffect, useMemo, useRef } from 'react'
import { Icon } from '../components/Icon'
import { uploadUrl } from '../lib/api'
import { buttonClass } from './styles'

// Backend yalnızca bu uzantıları kabul eder (FileService)
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif'

function usePreview(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  return url
}

/** Tek görsel (kapak): mevcut görseli veya seçilen yeni dosyanın önizlemesini gösterir */
export function CoverInput({
  currentPath,
  file,
  onChange,
  aspect = 'aspect-[16/9]',
}: {
  currentPath: string | null | undefined
  file: File | null
  onChange: (file: File | null) => void
  aspect?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = usePreview(file)
  const src = preview ?? uploadUrl(currentPath)

  return (
    <div className="space-y-2">
      <div className={`relative w-full overflow-hidden rounded-xl bg-surface-container ${aspect}`}>
        {src ? (
          <img src={src} alt="Kapak fotoğrafı" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-on-surface-variant">
            <Icon name="add_photo_alternate" className="text-4xl" />
            <span className="text-body-sm">Kapak fotoğrafı seçilmedi</span>
          </div>
        )}
        {file && (
          <span className="absolute top-2 left-2 rounded-full bg-secondary px-2.5 py-1 text-label-sm text-on-secondary">Kaydedince yüklenecek</span>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} className={buttonClass.secondary}>
          <Icon name="upload" className="text-base" />
          {src ? 'Değiştir' : 'Fotoğraf seç'}
        </button>
        {file && (
          <button type="button" onClick={() => onChange(null)} className={buttonClass.secondary}>Seçimi geri al</button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
    </div>
  )
}

/** Birden çok yeni görsel seçimi (henüz yüklenmemiş dosyalar) */
export function NewImagesInput({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-3">
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((f, i) => (
            <PendingThumb key={`${f.name}-${i}`} file={f} onRemove={() => onChange(files.filter((_, j) => j !== i))} />
          ))}
        </div>
      )}
      <button type="button" onClick={() => inputRef.current?.click()} className={buttonClass.secondary}>
        <Icon name="add_photo_alternate" className="text-base" /> Görsel ekle
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          onChange([...files, ...Array.from(e.target.files ?? [])])
          e.target.value = ''
        }}
      />
    </div>
  )
}

function PendingThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const preview = usePreview(file)
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container">
      {preview && <img src={preview} alt={file.name} className="h-full w-full object-cover" />}
      <button type="button" aria-label={`${file.name} görselini çıkar`} onClick={onRemove}
        className="absolute top-2 right-2 rounded-full bg-surface-bright/90 p-1 text-primary shadow">
        <Icon name="close" className="text-base" />
      </button>
    </div>
  )
}
