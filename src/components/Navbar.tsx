import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, Menu, X, Star, Bell, LogOut, User, LayoutDashboard, Map, Trophy } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = profile?.role === 'lga_admin' || profile?.role === 'super_admin'

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const navLinks = user
    ? isAdmin
      ? [
          { to: '/admin', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/map', label: 'Heatmap', icon: Map },
          { to: '/admin/reports', label: 'Reports', icon: Bell },
          { to: '/admin/analytics', label: 'Analytics', icon: Star },
        ]
      : [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/report', label: 'Report Waste', icon: Bell },
          { to: '/map', label: 'Live Map', icon: Map },
          { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        ]
    : [
        { to: '/map', label: 'Live Map', icon: Map },
        { to: '/impact', label: 'Impact', icon: Star },
        { to: '/about', label: 'About', icon: null },
      ]

  return (
    <nav style={{
      background: '#1E3A2F',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'white' }}>
          <div style={{ width: 36, height: 36, background: '#C9A84C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={20} color="#1E3A2F" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
            Sweep <span style={{ color: '#C9A84C' }}>&</span> Green
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              color: location.pathname === to ? '#C9A84C' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              background: location.pathname === to ? 'rgba(201,168,76,0.15)' : 'transparent',
            }}>{label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user && profile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Points badge */}
              <div style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '999px', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Star size={14} color="#C9A84C" fill="#C9A84C" />
                <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.875rem' }}>{profile.green_points.toLocaleString()} pts</span>
              </div>
              {/* Avatar */}
              <Link to="/profile" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'white' }}>
                <User size={18} />
              </Link>
              <button onClick={handleSignOut} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem', display: 'flex', minHeight: 'auto' }}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn-outline" style={{ padding: '0.45rem 1rem', color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', minHeight: 'auto' }}>Login</Link>
              <Link to="/register" className="btn-gold" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem', minHeight: 'auto' }}>Get Started</Link>
            </div>
          )}

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem', minHeight: 'auto' }} className="mobile-menu-btn">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#152A22', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.25rem 1rem' }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              display: 'block',
              color: location.pathname === to ? '#C9A84C' : 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              padding: '0.875rem 0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              fontWeight: 600,
              fontSize: '1rem',
            }}>{label}</Link>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/login" className="btn-outline" onClick={() => setMenuOpen(false)} style={{ flex: 1, color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>Login</Link>
              <Link to="/register" className="btn-gold" onClick={() => setMenuOpen(false)} style={{ flex: 1 }}>Register</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
      `}</style>
    </nav>
  )
}
