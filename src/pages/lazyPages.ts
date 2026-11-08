import { lazy } from 'react'

// Ana sayfa dışındaki sayfalar ayrı parça olarak, açıldıklarında yüklenir
export const VenueDetailPage = lazy(() => import('./VenueDetailPage').then((m) => ({ default: m.VenueDetailPage })))

// Firma hesabı
export const LoginPage = lazy(() => import('./LoginPage').then((m) => ({ default: m.LoginPage })))
export const RegisterPage = lazy(() => import('./RegisterPage').then((m) => ({ default: m.RegisterPage })))
export const ForgotPasswordPage = lazy(() => import('./ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
export const ResetPasswordPage = lazy(() => import('./ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
export const InvitationOptOutPage = lazy(() => import('./InvitationOptOutPage').then((m) => ({ default: m.InvitationOptOutPage })))
export const ConfirmEmailPage = lazy(() => import('./ConfirmEmailPage').then((m) => ({ default: m.ConfirmEmailPage })))

// Firma paneli
export const PanelLayout = lazy(() => import('./PanelLayout').then((m) => ({ default: m.PanelLayout })))
export const VenuesPage = lazy(() => import('./VenuesPage').then((m) => ({ default: m.VenuesPage })))
export const MessagesPage = lazy(() => import('./MessagesPage').then((m) => ({ default: m.MessagesPage })))
export const VenueFormPage = lazy(() => import('./VenueFormPage').then((m) => ({ default: m.VenueFormPage })))
export const CompanyProfilePage = lazy(() => import('./CompanyProfilePage').then((m) => ({ default: m.CompanyProfilePage })))

// Yönetim paneli
export const AdminLoginPage = lazy(() => import('./AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
export const AdminLayout = lazy(() => import('./AdminLayout').then((m) => ({ default: m.AdminLayout })))
export const AdminDashboardPage = lazy(() => import('./AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
export const AdminVenuesPage = lazy(() => import('./AdminVenuesPage').then((m) => ({ default: m.AdminVenuesPage })))
export const AdminInvitationsPage = lazy(() => import('./AdminInvitationsPage').then((m) => ({ default: m.AdminInvitationsPage })))
export const AdminCompaniesPage = lazy(() => import('./AdminCompaniesPage').then((m) => ({ default: m.AdminCompaniesPage })))
export const AdminUsersPage = lazy(() => import('./AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
export const AdminMessagesPage = lazy(() => import('./AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })))
