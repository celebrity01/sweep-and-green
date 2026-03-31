import { Link } from 'react-router-dom'
import { Leaf, MapPin, Trophy, Star, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#152A22', color: 'rgba(255,255,255,0.8)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 32, height: 32, background: '#C9A84C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={18} color="#1E3A2F" />
              </div>
              <span style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem' }}>Sweep & Green</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)' }}>
              Community-driven environmental action for a cleaner Sokoto State.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.75rem' }}>
              Built for Sokoto residents by 3MTT Fellow FE/23/71380770
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>Platform</h4>
            {[
              { to: '/map', label: 'Live Waste Map', icon: MapPin },
              { to: '/impact', label: 'Impact Dashboard', icon: Star },
              { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
              { to: '/report', label: 'Report Waste', icon: Leaf },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color 0.2s' }}>
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>Support</h4>
            {[
              { to: '/about', label: 'About the Platform' },
              { to: '/register', label: 'Join as Resident' },
              { to: '/login', label: 'Crew / LGA Login' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{label}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>Contact</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <MapPin size={14} />
              Sokoto State, Nigeria
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              <Phone size={14} />
              WhatsApp: Crew Dispatch Only
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>© 2025 Sweep & Green. All rights reserved.</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>🌿 Building a cleaner Sokoto, together.</p>
        </div>
      </div>
    </footer>
  )
}
