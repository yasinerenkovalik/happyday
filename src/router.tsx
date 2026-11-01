import { createBrowserRouter, Navigate } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import { ExplorePage } from './pages/ExplorePage'
import {
  AdminCompaniesPage,
  AdminDashboardPage,
  AdminLayout,
  AdminLoginPage,
  AdminMessagesPage,
  AdminUsersPage,
  AdminVenuesPage,
  CompanyProfilePage,
  ConfirmEmailPage,
  ForgotPasswordPage,
  LoginPage,
  MessagesPage,
  PanelLayout,
  RegisterPage,
  ResetPasswordPage,
  VenueDetailPage,
  VenueFormPage,
  VenuesPage,
} from './pages/lazyPages'

export const router = createBrowserRouter([
  { path: '/', element: <ExplorePage /> },
  { path: '/mekan/:id', element: <VenueDetailPage /> },
  { path: '/giris', element: <LoginPage /> },
  { path: '/kayit', element: <RegisterPage /> },
  { path: '/sifremi-unuttum', element: <ForgotPasswordPage /> },
  // Bu iki adres backend'in gönderdiği e-postalardaki bağlantılarla aynı olmalı (Frontend:BaseUrl)
  { path: '/auth/reset-password', element: <ResetPasswordPage /> },
  { path: '/auth/confirm-email', element: <ConfirmEmailPage /> },
  {
    path: '/panel',
    element: (
      <RequireAuth role="Company">
        <PanelLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <VenuesPage /> },
      { path: 'mekanlar/yeni', element: <VenueFormPage /> },
      { path: 'mekanlar/:id', element: <VenueFormPage /> },
      { path: 'mesajlar', element: <MessagesPage /> },
      { path: 'firma', element: <CompanyProfilePage /> },
    ],
  },
  { path: '/admin/giris', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: (
      <RequireAuth role="Admin">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'firmalar', element: <AdminCompaniesPage /> },
      { path: 'mekanlar', element: <AdminVenuesPage /> },
      { path: 'kullanicilar', element: <AdminUsersPage /> },
      { path: 'mesajlar', element: <AdminMessagesPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
