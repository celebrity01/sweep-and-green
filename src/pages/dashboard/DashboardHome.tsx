import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Report } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { Star, MapPin, TrendingUp, Plus, ChevronRight, Clock } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: '#E67E22', assigned: '#3B82F6', in_progress: '#8B5CF6', resolved: '#27AE60', rejected: '#C0392B'
}

export default function DashboardHome() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('reports').select('*').eq('reporter_id', profile.id).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => { setReports(data as Report[] || []); setLoading(false) })
  }, [profile])

  const resolved = reports.filter(r => r.status === 'resolved').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1E3A2F' }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Resident'} 🌿
          </h1>
          <p style={{ color: '#666', marginTop: '0.25rem' }}>{profile?.ward}, {profile?.lga}</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: Star, label: 'Green Points', value: profile?.green_points.toLocaleString() || '0', color: '#C9A84C', bg: 'linear-gradient(135deg, #1E3A2F, #2E5845)', link: '/points' },
            { icon: MapPin, label: 'Total Reports', value: reports.length, color: '#3B82F6', bg: 'white', link: '/my-reports' },
            { icon: TrendingUp, label: 'Cleanups Done', value: resolved, color: '#27AE60', bg: 'white', link: '/my-reports' },
          ].map(({ icon: Icon, label, value, color, bg, link }) => (
            <Link key={label} to={link} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ background: bg, border: bg === 'white' ? '1px solid rgba(30,58,47,0.08)' : 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, background: `${color}15`, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <ChevronRight size={16} color={bg === 'white' ? '#ccc' : 'rgba(255,255,255,0.4)'} />
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 800, color: bg === 'white' ? color : '#C9A84C', marginTop: '0.75rem' }}>{loading ? '...' : value}</div>
                <div style={{ color: bg === 'white' ? '#888' : 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', fontWeight: 600, marginTop: '0.125rem' }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick report CTA */}
        <Link to="/report" style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #C9A84C, #a8893c)', borderRadius: '1rem', padding: '1.375rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#1E3A2F', fontSize: '1.125rem', fontFamily: 'Playfair Display, serif' }}>See waste nearby?</div>
              <div style={{ color: 'rgba(30,58,47,0.75)', fontSize: '0.875rem', marginTop: '0.15rem' }}>Report it now and earn +50 Green Points</div>
            </div>
            <div style={{ width: 52, height: 52, background: '#1E3A2F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={26} color="#C9A84C" />
            </div>
          </div>
        </Link>

        {/* Recent reports */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1E3A2F' }}>Recent Reports</h2>
            <Link to="/my-reports" style={{ color: '#1E3A2F', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>View all →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: '0.875rem' }} />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#999' }}>
              <MapPin size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 700, marginBottom: '0.375rem', color: '#666' }}>No reports yet</p>
              <p style={{ fontSize: '0.875rem' }}>Spot waste nearby? Be the first to report it!</p>
              <Link to="/report" className="btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>Make First Report</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reports.map(r => (
                <div key={r.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
                  {r.photo_url && <img src={r.photo_url} alt="waste" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '0.625rem', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: '#1E3A2F', fontSize: '0.9375rem' }}>{r.waste_type}</span>
                      <span style={{ background: `${STATUS_COLORS[r.status]}20`, color: STATUS_COLORS[r.status], padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.2rem', display: 'flex', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={11} />{r.ward}, {r.lga}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} />{new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
