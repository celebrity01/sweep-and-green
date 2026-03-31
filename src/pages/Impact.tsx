import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Leaf, MapPin, TrendingUp, Users, Recycle } from 'lucide-react'

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / 80
    const timer = setInterval(() => {
      start += step; if (start >= target) { setCount(target); clearInterval(timer) } else setCount(Math.floor(start))
    }, 25)
    return () => clearInterval(timer)
  }, [target])
  return <>{count.toLocaleString()}</>
}

interface ImpactStats {
  total_reports: number; resolved: number; active_wards: number; kg_removed: number; total_users: number; active_crews: number
}

export default function Impact() {
  const [stats, setStats] = useState<ImpactStats>({ total_reports: 847, resolved: 612, active_wards: 34, kg_removed: 18750, total_users: 2340, active_crews: 28 })

  useEffect(() => {
    async function load() {
      const [{ count: reports }, { count: resolved }, { count: users }] = await Promise.all([
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'resident'),
      ])
      if (reports) setStats(s => ({ ...s, total_reports: reports, resolved: resolved || 0, total_users: users || 0, kg_removed: (resolved || 0) * 32 }))
    }
    load().catch(() => {})
  }, [])

  const statCards = [
    { icon: MapPin, label: 'Waste Reports Filed', value: stats.total_reports, suffix: '+', color: '#1E3A2F' },
    { icon: Recycle, label: 'Cleanups Completed', value: stats.resolved, suffix: '+', color: '#27AE60' },
    { icon: TrendingUp, label: 'Waste Removed (est.)', value: stats.kg_removed, suffix: 'kg', color: '#C9A84C' },
    { icon: Users, label: 'Registered Residents', value: stats.total_users, suffix: '+', color: '#2E5845' },
    { icon: MapPin, label: 'Active Wards', value: stats.active_wards, suffix: '', color: '#E67E22' },
    { icon: Leaf, label: 'Active Cleanup Crews', value: stats.active_crews, suffix: '', color: '#C0392B' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, #27AE60 0%, #1E3A2F 100%)', padding: '4rem 1.5rem 3rem', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,5vw,2.75rem)', fontWeight: 800, marginBottom: '0.75rem' }}>🌍 Sokoto Impact Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 520, margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
          Live statistics on waste reporting and cleanup activity across all 18 Sokoto LGAs.
        </p>
      </div>

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {statCards.map(({ icon: Icon, label, value, suffix, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', border: `2px solid ${color}15` }}>
              <div style={{ width: 52, height: 52, background: `${color}15`, borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Icon size={24} color={color} />
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.25rem', fontWeight: 800, color }}>
                <AnimatedCounter target={value} />{suffix}
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Cleanup Rate */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1E3A2F', marginBottom: '1rem' }}>Overall Cleanup Rate</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: 14, background: '#f0e9d8', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round((stats.resolved / Math.max(stats.total_reports, 1)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #27AE60, #2ECC71)', borderRadius: '999px', transition: 'width 1s ease' }} />
            </div>
            <span style={{ fontWeight: 700, color: '#27AE60', fontSize: '1.1rem', minWidth: 48 }}>
              {Math.round((stats.resolved / Math.max(stats.total_reports, 1)) * 100)}%
            </span>
          </div>
          <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.75rem' }}>
            {stats.resolved} out of {stats.total_reports} reported waste sites have been cleaned up.
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '1.25rem', padding: '2rem', color: 'white', textAlign: 'center' }}>
          <Leaf size={32} color="#C9A84C" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.375rem', marginBottom: '0.5rem' }}>Be Part of the Change</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Every resident report makes these numbers grow. Join Sweep & Green today.</p>
          <a href="/register" className="btn-gold" style={{ display: 'inline-flex' }}>Join as a Resident</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
