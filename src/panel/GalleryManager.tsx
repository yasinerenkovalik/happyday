import { useState } from 'react'
import { useAddVenueImages, useDeleteVenueImage } from '../api/panel'
import { Icon } from '../components/Icon'
import { uploadUrl } from '../lib/api'
import { NewImagesInput } from './ImageInputs'
import { buttonClass } from './styles'
import { ConfirmDialog, Notice } from './ui'

/** Kayıtlı bir mekanın galerisi: mevcut görselleri sil, yenilerini seçip yükle. */
export function GalleryManager({ companyId, venueId, images }: { companyId: string; venueId: string; images: { id: number; imageUrl: string }[] }) {
  const add = useAddVenueImages(companyId, venueId)
  const remove = useDeleteVenueImage(companyId)
  const [pending, setPending] = useState<File[]>([])
  const [toDelete, setToDelete] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container">
              <img src={uploadUrl(img.imageUrl)} alt="" className="h-full w-full object-cover" />
              <button type="button" aria-label="Görseli sil" onClick={() => setToDelete(img.id)}
                className="absolute top-2 right-2 rounded-full bg-surface-bright/90 p-1.5 text-error shadow transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <Icon name="delete" className="text-base" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-sm text-on-surface-variant">Galeride henüz görsel yok.</p>
      )}

      <NewImagesInput files={pending} onChange={setPending} />
      {pending.length > 0 && (
        <button type="button" disabled={add.isPending} className={buttonClass.primary}
          onClick={() => add.mutate(pending, { onSuccess: () => setPending([]) })}>
          <Icon name="cloud_upload" className="text-base" />
          {add.isPending ? 'Yükleniyor…' : `${pending.length} görseli yükle`}
        </button>
      )}
      {add.error && <Notice tone="error">{add.error.message}</Notice>}

      {toDelete !== null && (
        <ConfirmDialog
          title="Görseli sil"
          message="Bu görsel galeriden kaldırılacak."
          confirmLabel="Sil"
          pending={remove.isPending}
          onConfirm={() => remove.mutate(toDelete, { onSuccess: () => setToDelete(null) })}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
