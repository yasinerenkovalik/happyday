// Yönetim paneli: yalnızca Admin oturumuyla çalışır (api/admin/*)
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiData, apiMessage } from '../lib/api'
import type { AdminCompany, AdminDashboard, AdminInvitation, AdminMessage, AdminUser, AdminVenue } from '../lib/types'

export const ADMIN_PAGE_SIZE = 20

function listQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  search.set('PageSize', String(ADMIN_PAGE_SIZE))
  return search.toString()
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiData<AdminDashboard>('/api/admin/dashboard'),
  })
}

export function useAdminCompanies(filter: { search: string; isApproved?: boolean; page: number }) {
  return useQuery({
    queryKey: ['admin', 'companies', filter],
    queryFn: () =>
      apiData<AdminCompany[]>(`/api/admin/companies?${listQuery({ Search: filter.search, IsApproved: filter.isApproved, PageNumber: filter.page })}`),
    placeholderData: keepPreviousData,
  })
}

export function useSetCompanyApproval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, isApproved }: { companyId: string; isApproved: boolean }) => {
      const form = new FormData()
      form.set('CompanyId', companyId)
      form.set('IsApproved', String(isApproved))
      return apiData<unknown>('/api/admin/companies/approval', { method: 'POST', body: form })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['venues'] }) // onay, mekanların sitede görünmesini değiştirir
    },
  })
}

export function useAdminUsers(filter: { search: string; page: number }) {
  return useQuery({
    queryKey: ['admin', 'users', filter],
    queryFn: () => apiData<AdminUser[]>(`/api/admin/users?${listQuery({ Search: filter.search, PageNumber: filter.page })}`),
    placeholderData: keepPreviousData,
  })
}

export function useSetUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, isActivated }: { userId: string; isActivated: boolean }) => {
      const form = new FormData()
      form.set('UserId', userId)
      form.set('IsActivated', String(isActivated))
      return apiData<unknown>('/api/admin/users/active', { method: 'POST', body: form })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useAdminInvitations(page: number) {
  return useQuery({
    queryKey: ['admin', 'invitations', page],
    queryFn: () => apiData<AdminInvitation[]>(`/api/admin/invitations?${listQuery({ PageNumber: page })}`),
    placeholderData: keepPreviousData,
  })
}

export function useSendInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invitation: { email: string; companyName: string | null; subject: string; message: string }) =>
      apiMessage('/api/admin/invitations/send', { method: 'POST', body: invitation }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'invitations'] }),
  })
}

export function useAdminMessages(filter: { search: string; page: number }) {
  return useQuery({
    queryKey: ['admin', 'messages', filter],
    queryFn: () => apiData<AdminMessage[]>(`/api/admin/messages?${listQuery({ Search: filter.search, PageNumber: filter.page })}`),
    placeholderData: keepPreviousData,
  })
}

export type AdminVenueStatus = 'Published' | 'Removed' | 'Unapproved'

export function useAdminVenues(filter: { search: string; status?: AdminVenueStatus; page: number }) {
  return useQuery({
    queryKey: ['admin', 'venues', filter],
    queryFn: () =>
      apiData<AdminVenue[]>(`/api/admin/organizations?${listQuery({ Search: filter.search, Status: filter.status, PageNumber: filter.page })}`),
    placeholderData: keepPreviousData,
  })
}

/** Moderasyon değişince admin listeleri ve sitedeki mekan sorguları yenilenir */
function useInvalidateModeration() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] })
    queryClient.invalidateQueries({ queryKey: ['venues'] })
  }
}

export function useRemoveVenue() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: ({ venueId, reason }: { venueId: string; reason: string }) =>
      apiMessage(`/api/admin/organizations/${venueId}/remove`, { method: 'POST', body: { reason } }),
    onSuccess: invalidate,
  })
}

export function useRestoreVenue() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: (venueId: string) => apiMessage(`/api/admin/organizations/${venueId}/restore`, { method: 'POST' }),
    onSuccess: invalidate,
  })
}
