// Backend DTO'larının (HappyDay.Application) frontend karşılıkları. JSON alanları camelCase gelir.

export type Company = {
  name: string
  email: string
  adress: string
  phoneNumber: string
  description: string
  latitude: number
  longitude: number
  coverPhotoPath: string | null
  cityId: number
  districtId: number
  /** Onaylanmamış firmanın mekanları sitede listelenmez */
  isApproved: boolean
  isEmailConfirmed: boolean
}

/** GET api/organizations/by-company/{companyId} */
export type CompanyVenue = {
  id: string
  title: string
  categoryId: number
  description: string
  location: string | null
  services: string[]
  isOutdoor: boolean
  coverPhotoPath: string | null
  price: number
  maxGuestCount: number
  /** Yönetici yayından kaldırdıysa (yalnızca firma panelinde dolu) */
  removedByAdminAt?: string | null
  removalReason?: string | null
}

/** GET api/contact-messages */
export type ContactMessage = {
  id: string
  fullName: string
  phone: string
  email: string
  message: string
  organizationId: string
  companyId: string
  createDate: string
  organizationTitle: string
  cityName: string
  districtName: string
}

export type Package = {
  id: string
  name: string
  description: string
  price: number
  pricePerPerson: number | null
  maxGuests: number | null
}

export type Category = { id: number; name: string }
/** latitude/longitude: il merkezi */
export type City = { id: number; cityName: string; latitude: number; longitude: number }
export type District = { id: number; districtName: string }

/** GET api/organizations/{id}/with-images — yalnızca yayındaki mekan */
export type VenueDetail = {
  id: string
  title: string
  description: string
  price: number
  categoryId: number | null
  companyId: string
  companyName: string
  companyAddress: string
  maxGuestCount: number
  services: string[]
  duration: string
  isOutdoor: boolean
  reservationNote: string | null
  cancelPolicy: string | null
  videoUrl: string | null
  coverPhotoPath: string | null
  /** Mekanın kendi konumu; firma adresi companyAddress'te */
  cityId: number
  cityName: string
  districtId: number
  districtName: string
  adress: string
  latitude: number
  longitude: number
  images: { id: number; imageUrl: string }[]
  /** Yönetici yayından kaldırdıysa (yalnızca firma panelinde dolu) */
  removedByAdminAt?: string | null
  removalReason?: string | null
}

export type PagedResult<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

/** GET api/organizations/filter — yalnızca yayında olan (firması onaylı) mekanlar */
export type VenueListItem = {
  id: string
  title: string
  categoryId: number
  description: string
  price: number
  maxGuestCount: number
  services: string[]
  isOutdoor: boolean
  coverPhotoPath: string | null
  companyId: string
  cityId: number
  cityName: string
  districtId: number
  districtName: string
  latitude: number
  longitude: number
}

// ---- Yönetim paneli (api/admin/*) ----

export type AdminDashboard = {
  totalCompanies: number
  pendingCompanies: number
  approvedCompanies: number
  totalOrganizations: number
  totalUsers: number
  totalMessages: number
  messagesLast7Days: number
  messagesToday: number
  dailyMessages: { date: string; count: number }[]
  topCompanies: { companyId: string; companyName: string; count: number }[]
}

export type AdminCompany = {
  id: string
  name: string
  email: string
  phoneNumber: string
  adress: string
  isApproved: boolean
  isEmailConfirmed: boolean
  isActivated: boolean
  createDate: string
  organizationCount: number
  userCount: number
  messageCount: number
}

export type AdminUser = {
  id: string
  name: string
  surName: string
  fullName: string
  email: string
  phoneNumber: string
  isActivated: boolean
  createDate: string
  companyId: string | null
  companyName: string | null
}

export type AdminMessage = {
  id: string
  fullName: string
  phone: string
  email: string
  message: string
  createDate: string
  companyId: string
  companyName: string
  organizationTitle: string
  cityName: string
  districtName: string
}

export type AdminVenue = {
  id: string
  title: string
  companyId: string
  companyName: string
  companyApproved: boolean
  cityName: string
  districtName: string
  coverPhotoPath: string | null
  price: number
  createDate: string
  removedByAdminAt: string | null
  removalReason: string | null
}
