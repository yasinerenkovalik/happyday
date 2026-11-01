// Backend ile tek iletişim noktası. Tüm uçlar GeneralResponse<T> döner:
// { data, isSuccess, message, errors }. İş kuralı hataları da 200 ile gelir (isSuccess: false),
// bu yüzden apiData() onları da ApiError olarak fırlatır; React Query tarafında tek tip hata olur.

import type { SessionInfo } from '../auth/session'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export type GeneralResponse<T> = {
  data: T | null
  isSuccess: boolean
  message: string | null
  errors: string[] | null
}

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string[]>
  /** Backend'in errors[0]'da döndürdüğü kod, ör. EMAIL_NOT_CONFIRMED */
  code?: string

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}, code?: string) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
    this.code = code
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Düz nesne JSON olarak, FormData multipart olarak gönderilir. */
  body?: unknown
}

/**
 * Cookie ile yapılan ve veri değiştiren isteklerde backend bu başlığı ister (CSRF koruması).
 * Başka bir sitedeki form bu başlığı ekleyemez.
 */
const CLIENT_HEADER = { 'X-Davetly-Client': 'web' }

// Bu uçlar 401 dönerse yenileme denenmez (sonsuz döngü olmasın)
const NO_REFRESH = ['/api/auth/refresh', '/api/auth/logout']

let onUnauthorized: (() => void) | undefined
let onRefreshed: ((session: SessionInfo) => void) | undefined
let refreshing: Promise<SessionInfo | null> | null = null

/** Oturum düşünce (401) ve yenilenince ne yapılacağını AuthProvider belirler. */
export function setAuthHandlers(handlers: { onUnauthorized: () => void; onRefreshed: (session: SessionInfo) => void }) {
  onUnauthorized = handlers.onUnauthorized
  onRefreshed = handlers.onRefreshed
}

/**
 * Access token'ın süresi dolunca refresh cookie'siyle yenisini alır. Aynı anda 401 alan istekler
 * tek bir yenileme isteğini bekler; refresh token her kullanımda değiştiği için ikinci istek atılmamalı.
 */
export function refreshSession(): Promise<SessionInfo | null> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(BASE_URL + '/api/auth/refresh', { method: 'POST', headers: CLIENT_HEADER, credentials: 'include' })
      if (!res.ok) return null
      const session = ((await res.json()) as GeneralResponse<SessionInfo>).data
      if (session) onRefreshed?.(session)
      return session
    } catch {
      return null
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}, canRefresh = true): Promise<T> {
  const headers: Record<string, string> = { ...CLIENT_HEADER }

  let payloadBody: BodyInit | undefined
  if (body instanceof FormData) {
    payloadBody = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payloadBody = JSON.stringify(body)
  }

  let res: Response
  try {
    // credentials: API ayrı bir alan adındaysa (VITE_API_URL) da oturum cookie'leri gitsin
    res = await fetch(BASE_URL + path, { method, headers, body: payloadBody, credentials: 'include' })
  } catch {
    throw new ApiError('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.', 0)
  }

  if (res.status === 401) {
    // Access token'ın süresi dolmuş olabilir: bir kez yenileyip isteği tekrarla
    if (canRefresh && !NO_REFRESH.includes(path) && (await refreshSession())) {
      return api<T>(path, { method, body }, false)
    }
    onUnauthorized?.()
    throw new ApiError('Oturumunuzun süresi doldu, lütfen tekrar giriş yapın.', 401)
  }

  const payload = await res.json().catch(() => null)

  if (res.status === 403) throw new ApiError('Bu işlem için yetkiniz yok.', 403)
  if (res.status === 429) throw new ApiError('Çok fazla deneme yaptınız, bir dakika sonra tekrar deneyin.', 429)

  if (!res.ok) {
    // 400: ASP.NET ValidationProblemDetails ({ title, errors: { Alan: [mesaj] } }) veya { message }
    const fieldErrors: Record<string, string[]> = payload?.errors && !Array.isArray(payload.errors) ? payload.errors : {}
    const firstFieldError = Object.values(fieldErrors)[0]?.[0]
    const message = payload?.message ?? firstFieldError ?? payload?.title ?? 'Beklenmeyen bir hata oluştu.'
    throw new ApiError(message, res.status, fieldErrors)
  }

  return payload as T
}

/** GeneralResponse'u açar; isSuccess false ise mesajıyla birlikte hata fırlatır. */
export async function apiData<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await api<GeneralResponse<T>>(path, options)
  if (!res.isSuccess) {
    throw new ApiError(res.message ?? res.errors?.[0] ?? 'İşlem başarısız oldu.', 200, {}, res.errors?.[0])
  }
  return res.data as T
}

/** GeneralResponse'un mesajını döndürür (veri taşımayan işlemler için); isSuccess false ise hata fırlatır. */
export async function apiMessage(path: string, options?: RequestOptions): Promise<string> {
  const res = await api<GeneralResponse<unknown>>(path, options)
  if (!res.isSuccess) {
    throw new ApiError(res.message ?? res.errors?.[0] ?? 'İşlem başarısız oldu.', 200)
  }
  return res.message ?? ''
}

/** Backend'in döndürdüğü "/uploads/..." yolunu tarayıcıda açılabilir adrese çevirir. */
export function uploadUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  return BASE_URL + (path.startsWith('/') ? path : `/${path}`)
}
