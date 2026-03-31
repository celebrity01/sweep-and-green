import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Report } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { MapPin, Clock, Filter } from 'lucide-react'

const STATUS_OPTS = ['all', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected']
const STATUS_COLORS: Record<string, string> = {
  pending: '#E67E22', assigned: '#3B82F6', in_progress: '#8B5CF6', resolved: '#27AE60', rejected: '#C0392B'
}
const SEV_COLORS: Record<string, string> = { low: '#27AE60', medium: '#E67E22', high: '#E74C3C', critical: '#C0392B' }

export default function MyReports() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    let q = supabase.from('reports').select('*').eq('reporter_id', profile.id).order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => { setReports(data as Report[] || []); setLoading(false) })
  }, [profile, filter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1E3A2F' }}>My Reports</h1>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>{reports.length} report{reports.length !== 1 ? 's' : ''} found</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#666" />
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #e0d9cc', borderRadius: '0.5rem', fontSize: '0.875rem', background: 'white', fontFamily: 'Lato, sans-serif', appearance: 'none' }}>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: '1rem' }} />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <MapPin size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ color: '#666', fontWeight: 700 }}>No reports found</p>
            <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '0.375rem' }}>
              {filter !== 'all' ? `No ${filter.replace('_', ' ')} reports` : 'You haven\'t submitted any reports yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {r.photo_url ? (
                  <img src={r.photo_url} alt="waste" style={{ width: 88, height: 72, objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 88, height: 72, background: '#f0e9d8', borderRadius: '0.75rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={24} color="#c5b89a" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.0625rem', color: '#1E3A2F', fontWeight: 700 }}>{r.waste_type}</h3>
                    <span style={{ background: `${STATUS_COLORS[r.status]}20`, color: STATUS_COLORS[r.status], padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8125rem', color: '#777' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{r.ward}, {r.lga}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} />{new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ color: SEV_COLORS[r.severity], fontWeight: 700, textTransform: 'capitalize' }}>⚠ {r.severity}</span>
                  </div>
                  {r.description && <p style={{ color: '#888', fontSize: '0.8125rem', marginTop: '0.375rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.description}</p>}
                  {r.status === 'resolved' && r.after_photo_url && (
                    <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#27AE60', fontSize: '0.8rem', fontWeight: 700 }}>
                      ✅ Cleanup verified — after photo available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
