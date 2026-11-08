// Firma hesabı: kayıt, e-posta doğrulama ve şifre sıfırlama. Hepsi giriş gerektirmez.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiMessage } from '../lib/api'
import type { LocationValue } from '../panel/location'

export type RegisterForm = LocationValue & {
  name: string
  email: string
  password: string
  phoneNumber: string
  description: string
  coverPhoto: File | null
}

/** POST api/companies — yanıt mesajı, doğrulama e-postası gönderilemediyse bunu da söyler */
export function useRegisterCompany() {
  return useMutation({
    mutationFn: (f: RegisterForm) => {
      const form = new FormData()
      form.set('Name', f.name)
      form.set('Email', f.email)
      form.set('Password', f.password)
      form.set('PhoneNumber', f.phoneNumber)
      form.set('Description', f.description)
      form.set('Adress', f.adress)
      form.set('CityId', String(f.cityId))
      form.set('DistrictId', String(f.districtId))
      form.set('Latitude', String(f.latitude))
      form.set('Longitude', String(f.longitude))
      if (f.coverPhoto) form.set('CoverPhotoPath', f.coverPhoto)
      return apiMessage('/api/companies', { method: 'POST', body: form })
    },
  })
}

/** Davet e-postasındaki "almak istemiyorum" bağlantısı */
export function useInvitationOptOut() {
  return useMutation({
    mutationFn: (token: string) => apiMessage('/api/invitations/opt-out', { method: 'POST', body: { token } }),
  })
}

/** E-postadaki bağlantı açılınca bir kez çalışır (StrictMode'da iki kez istek atmasın diye sorgu olarak) */
export function useConfirmEmail(companyId: string | null, token: string | null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['confirm-email', companyId, token],
    queryFn: async () => {
      const message = await apiMessage('/api/companies/confirm-email', { method: 'POST', body: { companyId, token } })
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] })
      return message
    },
    enabled: !!companyId && !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useResendConfirmation() {
  return useMutation({
    mutationFn: (email: string) => apiMessage('/api/companies/resend-confirmation', { method: 'POST', body: { email } }),
  })
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => apiMessage('/api/companies/request-password-reset', { method: 'POST', body: { email } }),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { companyId: string; token: string; newPassword: string }) =>
      apiMessage('/api/companies/reset-password', { method: 'POST', body }),
  })
}

/** Giriş yapmış hesabın şifresi; diğer cihazlardaki oturumlar kapanır, bu tarayıcı açık kalır */
export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      apiMessage('/api/auth/change-password', { method: 'POST', body }),
  })
}
