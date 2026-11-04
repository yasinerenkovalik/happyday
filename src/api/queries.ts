import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { api, apiData, type GeneralResponse } from '../lib/api'
import type {
  Category,
  City,
  CompanyVenue,
  ContactMessage,
  EventType,
  Package,
  PagedResult,
  VenueDetail,
  VenueListItem,
} from '../lib/types'

export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: () => apiData<VenueDetail>(`/api/organizations/${id}/with-images`),
  })
}

export function useVenuePackages(organizationId: string) {
  return useQuery({
    queryKey: ['venues', organizationId, 'packages'],
    queryFn: async () => {
      const res = await api<GeneralResponse<Package[]>>(`/api/packages/by-organization/${organizationId}`)
      return res.data ?? []
    },
  })
}

export type Inquiry = {
  organizationId: string
  fullName: string
  phone: string
  email: string
  message: string
  /** Bal küpü: gerçek kullanıcı boş bırakır, doluysa backend talebi sessizce yok sayar */
  website: string
}

/** Ziyaretçinin teklif talebi; firmanın panelindeki Mesajlar sayfasına düşer. */
export function useSendInquiry() {
  return useMutation({
    mutationFn: (inquiry: Inquiry) => {
      const form = new FormData()
      form.set('OrganizationId', inquiry.organizationId)
      form.set('FullName', inquiry.fullName)
      form.set('Phone', inquiry.phone)
      form.set('Email', inquiry.email)
      form.set('Message', inquiry.message)
      form.set('Website', inquiry.website)
      return apiData<unknown>('/api/contact-messages', { method: 'POST', body: form })
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiData<Category[]>('/api/categories'),
    staleTime: Infinity, // kategoriler nadiren değişir
  })
}

export function useEventTypes() {
  return useQuery({
    queryKey: ['event-types'],
    queryFn: () => apiData<EventType[]>('/api/event-types'),
    staleTime: Infinity, // backend'de sabit liste
  })
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => apiData<City[]>('/api/cities'),
    staleTime: Infinity,
  })
}

export type VenueFilters = {
  cityId?: number
  categoryId?: number
  /** Etkinlik slug'ı (dugun, nisan...) */
  eventType?: string
  minCapacity?: number
  maxPrice?: number
  isOutdoor?: boolean
  sortByPriceAsc?: boolean
  page: number
}

export const VENUE_PAGE_SIZE = 12

export function useVenueSearch(filters: VenueFilters) {
  return useQuery({
    queryKey: ['venues', 'search', filters],
    queryFn: () => {
      const qs = new URLSearchParams({ Page: String(filters.page), PageSize: String(VENUE_PAGE_SIZE) })
      if (filters.cityId) qs.set('CityId', String(filters.cityId))
      if (filters.categoryId) qs.set('CategoryId', String(filters.categoryId))
      if (filters.eventType) qs.set('EventType', filters.eventType)
      if (filters.minCapacity) qs.set('MinCapacity', String(filters.minCapacity))
      if (filters.maxPrice) qs.set('MaxPrice', String(filters.maxPrice))
      if (filters.isOutdoor !== undefined) qs.set('IsOutdoor', String(filters.isOutdoor))
      if (filters.sortByPriceAsc) qs.set('SortByPriceAsc', 'true')
      return apiData<PagedResult<VenueListItem>>(`/api/organizations/filter?${qs}`)
    },
    placeholderData: keepPreviousData, // filtre değişirken liste boşalıp zıplamasın
  })
}

export function useCompanyVenues(companyId: string) {
  return useQuery({
    queryKey: ['companies', companyId, 'venues'],
    queryFn: () => apiData<CompanyVenue[]>(`/api/organizations/by-company/${companyId}`),
  })
}

export function useContactMessages() {
  return useQuery({
    queryKey: ['contact-messages'],
    // Firma kendi mesajlarını görür (backend oturumdaki firmayı kullanır); mesaj yoksa boş liste döner
    queryFn: () => apiData<ContactMessage[]>('/api/contact-messages'),
  })
}
