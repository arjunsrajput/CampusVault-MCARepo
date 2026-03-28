import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { useAuthStore } from './store/authStore.js'
import Layout from './components/layout/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import VerifyEmailPage from './pages/VerifyEmailPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import BrowsePage from './pages/BrowsePage.jsx'
import DirectoryPage from './pages/DirectoryPage.jsx'
import BatchDirectoryPage from './pages/BatchDirectoryPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import GapsPage from './pages/GapsPage.jsx'
import MyUploadsPage from './pages/MyUploadsPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import MaterialPage from './pages/MaterialPage.jsx'

function Protected({ children, adminOnly = false }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function Public({ children }) {
  const { user } = useAuthStore()
  return user ? <Navigate to="/" replace /> : children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style:{background:'#18181b',color:'#eeedf5',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',fontSize:'14px'}
      }}/>
      <Routes>
        <Route path="/login"    element={<Public><LoginPage /></Public>} />
        <Route path="/register" element={<Public><RegisterPage /></Public>} />
        <Route path="/verify-email" element={<Public><VerifyEmailPage /></Public>} />
        <Route path="/forgot-password" element={<Public><ForgotPasswordPage /></Public>} />
        <Route path="/reset-password" element={<Public><ResetPasswordPage /></Public>} />
        <Route element={<Protected><Layout /></Protected>}>
          <Route index             element={<BrowsePage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/directory/:batch" element={<BatchDirectoryPage />} />
          <Route path="/upload"    element={<UploadPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/gaps"      element={<GapsPage />} />
          <Route path="/my-uploads" element={<MyUploadsPage />} />
          <Route path="/saved"     element={<SavedPage />} />
          <Route path="/material/:id" element={<MaterialPage />} />
          <Route path="/admin"     element={<Protected adminOnly><AdminPage /></Protected>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
