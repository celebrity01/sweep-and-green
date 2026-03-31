import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import Impact from './pages/Impact'
import PublicMap from './pages/PublicMap'

// Resident Dashboard
import DashboardHome from './pages/dashboard/DashboardHome'
import ReportWaste from './pages/dashboard/ReportWaste'
import MyReports from './pages/dashboard/MyReports'
import GreenPoints from './pages/dashboard/GreenPoints'
import Rewards from './pages/dashboard/Rewards'
import Profile from './pages/dashboard/Profile'
import Leaderboard from './pages/dashboard/Leaderboard'

// LGA Admin
import AdminOverview from './pages/admin/AdminOverview'
import AdminReports from './pages/admin/AdminReports'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminExport from './pages/admin/AdminExport'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/map" element={<PublicMap />} />

          {/* Resident routes (any logged-in user) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportWaste /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
          <Route path="/points" element={<ProtectedRoute><GreenPoints /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

          {/* LGA Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole={['lga_admin', 'super_admin']}><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole={['lga_admin', 'super_admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole={['lga_admin', 'super_admin']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/export" element={<ProtectedRoute requiredRole={['lga_admin', 'super_admin']}><AdminExport /></ProtectedRoute>} />
          <Route path="/admin/map" element={<ProtectedRoute requiredRole={['lga_admin', 'super_admin']}><PublicMap /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
