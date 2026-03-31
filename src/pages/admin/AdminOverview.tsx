import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { AlertTriangle, CheckCircle, Users, Clock, BarChart2, MapPin, Download, UserCog } from 'lucide-react'

interface AdminStats { open: number; resolved: number; in_progress: number; crew: number; week_reports: number }

export default function AdminOverview() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<AdminStats>({ open: 0, resolved: 0, in_progress: 0, crew: 0, week_reports: 0 })
  const [recentReports, setRecentReports] = useState<{ id: string; waste_type: string; ward: string; severity: string; status: string; created_at: string }[]>([])

  useEffect(() => {
    if (!profile) return
    const lga = profile.lga

    Promise.all([
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('lga', lga).in('status', ['pending', 'assigned']),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('lga', lga).eq('status', 'resolved'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('lga', lga).eq('status', 'in_progress'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('lga', lga).eq('role', 'crew'),
      supabase.from('reports').select('id,waste_type,ward,severity,status,created_at').eq('lga', lga).order('created_at', { ascending: false }).limit(6),
    ]).then(([open, resolved, inprog, crew, recent]) => {
      setStats({ open: open.count || 0, resolved: resolved.count || 0, in_progress: inprog.count || 0, crew: crew.count || 0, week_reports: (open.count || 0) + (resolved.count || 0) + (inprog.count || 0) })
      setRecentReports((recent.data || []) as typeof recentReports)
    })
  }, [profile])

  const cards = [
    { icon: AlertTriangle, label: 'Open Reports', value: stats.open, color: '#E67E22', link: '/admin/reports' },
    { icon: Clock, label: 'In Progress', value: stats.in_progress, color: '#8B5CF6', link: '/admin/reports' },
    { icon: CheckCircle, label: 'Resolved', value: stats.resolved, color: '#27AE60', link: '/admin/reports' },
    { icon: Users, label: 'Active Crews', value: stats.crew, color: '#3B82F6', link: '/admin/crews' },
  ]

  const navLinks = [
    { to: '/admin/map', label: 'Heatmap', icon: MapPin },
    { to: '/admin/reports', label: 'Reports', icon: AlertTriangle },
    { to: '/admin/crews', label: 'Crews', icon: UserCog },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/export', label: 'Export', icon: Download },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <div style={{ background: '#152A22', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem', display: 'flex', gap: '0' }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid transparent', transition: 'all 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#C9A84C'; el.style.borderBottomColor = '#C9A84C' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(255,255,255,0.7)'; el.style.borderBottomColor = 'transparent' }}>
              <Icon size={15} />{label}
            </Link>
          ))}
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1E3A2F' }}>LGA Admin — {profile?.lga}</h1>
          <p style={{ color: '#666', marginTop: '0.25rem' }}>{stats.week_reports} total reports • {stats.open} awaiting response</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {cards.map(({ icon: Icon, label, value, color, link }) => (
            <Link key={label} to={link} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ border: `2px solid ${color}20`, transition: 'transform 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
                <Icon size={22} color={color} style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.25rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ color: '#888', fontSize: '0.8125rem', fontWeight: 600 }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent reports table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1E3A2F' }}>Recent Reports</h3>
            <Link to="/admin/reports" style={{ color: '#1E3A2F', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>Manage all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f5f0e8' }}>
                  {['Waste Type', 'Ward', 'Severity', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0e9d8', background: i % 2 === 0 ? 'white' : '#fdf9f4' }}>
                    <td style={{ padding: '0.75rem 0.875rem', fontWeight: 600, color: '#1E3A2F' }}>{r.waste_type}</td>
                    <td style={{ padding: '0.75rem 0.875rem', color: '#555' }}>{r.ward}</td>
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', background: r.severity === 'critical' ? '#FEE2E2' : r.severity === 'high' ? '#FEF3C7' : '#f0fdf4', color: r.severity === 'critical' ? '#991B1B' : r.severity === 'high' ? '#92400E' : '#065F46' }}>
                        {r.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', background: r.status === 'resolved' ? '#D1FAE5' : '#FEF3C7', color: r.status === 'resolved' ? '#065F46' : '#92400E' }}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', color: '#888' }}>{new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentReports.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No reports found for {profile?.lga}</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
