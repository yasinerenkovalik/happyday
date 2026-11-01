// Firma paneli için okuma ve yazma işlemleri. Yazma işlemlerinden sonra ilgili sorgular
// geçersiz kılınır; panel ve ziyaretçi sitesi aynı veriyi tekrar çeker.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiData } from '../lib/api'
import type { Company, District, Package, VenueDetail } from '../lib/types'
import type { LocationValue } from '../panel/location'

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: ['companies', companyId],
    queryFn: () => apiData<Company>(`/api/companies/${companyId}`),
  })
}

export function useDistricts(cityId: number | undefined) {
  return useQuery({
    queryKey: ['districts', cityId],
    queryFn: () => apiData<District[]>(`/api/districts/by-city/${cityId}`),
    enabled: !!cityId,
    staleTime: Infinity,
  })
}

export type CompanyForm = {
  name: string
  phoneNumber: string
  adress: string
  description: string
  cityId: number
  districtId: number
  latitude: number
  longitude: number
  coverPhoto: File | null
}

export function useUpdateCompany(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (f: CompanyForm) => {
      const form = new FormData()
      form.set('Name', f.name)
      form.set('PhoneNumber', f.phoneNumber)
      form.set('Adress', f.adress)
      form.set('Description', f.description)
      form.set('CityId', String(f.cityId))
      form.set('DistrictId', String(f.districtId))
      form.set('Latitude', String(f.latitude))
      form.set('Longitude', String(f.longitude))
      if (f.coverPhoto) form.set('CoverPhoto', f.coverPhoto)
      return apiData<unknown>(`/api/companies/${companyId}`, { method: 'PUT', body: form })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] })
      queryClient.invalidateQueries({ queryKey: ['venues'] }) // konum ve firma adı mekan sayfalarında da görünür
    },
  })
}

/** Panelde düzenlenen mekan; yayında olmasa da (firma onaysızken) döner */
export function useManagedVenue(id: string | undefined) {
  return useQuery({
    queryKey: ['venues', id, 'manage'],
    queryFn: () => apiData<VenueDetail>(`/api/organizations/${id}/manage`),
    enabled: !!id,
  })
}

export type VenueForm = LocationValue & {
  title: string
  categoryId: number
  description: string
  price: number
  maxGuestCount: number
  duration: string
  isOutdoor: boolean
  services: string[]
  reservationNote: string
  cancelPolicy: string
  videoUrl: string
  coverPhoto: File | null
}

function venueFormData(f: VenueForm) {
  const form = new FormData()
  form.set('Title', f.title)
  form.set('CategoryId', String(f.categoryId))
  form.set('Description', f.description)
  form.set('Price', String(f.price))
  form.set('MaxGuestCount', String(f.maxGuestCount))
  form.set('Duration', f.duration)
  form.set('IsOutdoor', String(f.isOutdoor))
  f.services.forEach((s) => form.append('Services', s))
  // Boş gönderilen isteğe bağlı alanlar backend'de temizlenir
  form.set('ReservationNote', f.reservationNote)
  form.set('CancelPolicy', f.cancelPolicy)
  form.set('VideoUrl', f.videoUrl)
  form.set('CityId', String(f.cityId))
  form.set('DistrictId', String(f.districtId))
  form.set('Adress', f.adress)
  form.set('Latitude', String(f.latitude))
  form.set('Longitude', String(f.longitude))
  if (f.coverPhoto) form.set('CoverPhoto', f.coverPhoto)
  return form
}

function useInvalidateVenues(companyId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['venues'] })
    queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'venues'] })
  }
}

export function useCreateVenue(companyId: string) {
  const invalidate = useInvalidateVenues(companyId)
  return useMutation({
    mutationFn: ({ venue, images }: { venue: VenueForm; images: File[] }) => {
      const form = venueFormData(venue)
      form.set('CompanyId', companyId)
      images.forEach((img) => form.append('Images', img))
      return apiData<{ id: string }>('/api/organizations', { method: 'POST', body: form })
    },
    onSuccess: invalidate,
  })
}

export function useUpdateVenue(companyId: string, venueId: string) {
  const invalidate = useInvalidateVenues(companyId)
  return useMutation({
    mutationFn: (venue: VenueForm) => apiData<unknown>(`/api/organizations/${venueId}`, { method: 'PUT', body: venueFormData(venue) }),
    onSuccess: invalidate,
  })
}

export function useDeleteVenue(companyId: string) {
  const invalidate = useInvalidateVenues(companyId)
  return useMutation({
    mutationFn: (venueId: string) => apiData<unknown>(`/api/organizations/${venueId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}

export function useAddVenueImages(companyId: string, venueId: string) {
  const invalidate = useInvalidateVenues(companyId)
  return useMutation({
    // Uç tek görsel alır; seçilen her görsel sırayla yüklenir
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        const form = new FormData()
        form.set('OrganizationId', venueId)
        form.set('OrganizationImage', file)
        await apiData<unknown>('/api/organization-images', { method: 'POST', body: form })
      }
    },
    onSettled: invalidate,
  })
}

export function useDeleteVenueImage(companyId: string) {
  const invalidate = useInvalidateVenues(companyId)
  return useMutation({
    mutationFn: (imageId: number) => apiData<unknown>(`/api/organization-images/${imageId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}

export type PackageForm = Omit<Package, 'id'>

export function useSavePackage(companyId: string, venueId: string) {
  const invalidate = useInvalidateVenues(companyId)
  return useMutation({
    mutationFn: ({ id, ...pkg }: PackageForm & { id?: string }) =>
      id
        ? apiData<unknown>(`/api/packages/${id}`, { method: 'PUT', body: pkg })
        : apiData<unknown>('/api/packages', { method: 'POST', body: { ...pkg, organizationId: venueId } }),
    onSuccess: invalidate,
  })
}

export function useDeletePackage(companyId: string) {
  const invalidate = useInvalidateVenues(companyId)
  return useMutation({
    mutationFn: (packageId: string) => apiData<unknown>(`/api/packages/${packageId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
