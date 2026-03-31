import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Report } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { supabase as sb } from '../../lib/supabase'
import { Filter, MapPin, Clock, CheckCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: '#E67E22', assigned: '#3B82F6', in_progress: '#8B5CF6', resolved: '#27AE60', rejected: '#C0392B'
}

export default function AdminReports() {
  const { profile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [crews, setCrews] = useState<{ id: string; full_name: string }[]>([])
  const [loading, setLoading] = useState(true)

  async function loadReports() {
    if (!profile) return
    setLoading(true)
    let q = supabase.from('reports').select('*').eq('lga', profile.lga).order('created_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    setReports(data as Report[] || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!profile) return
    supabase.from('users').select('id,full_name').eq('lga', profile.lga).eq('role', 'crew')
      .then(({ data }) => setCrews(data as { id: string; full_name: string }[] || []))
    loadReports()
  }, [profile, statusFilter])

  async function updateStatus(reportId: string, newStatus: string) {
    await sb.from('reports').update({ status: newStatus, ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) }).eq('id', reportId)
    setReports(rs => rs.map(r => r.id === reportId ? { ...r, status: newStatus as Report['status'] } : r))
  }

  async function assignCrew(reportId: string, crewId: string) {
    await sb.from('reports').update({ assigned_crew_id: crewId, status: 'assigned' }).eq('id', reportId)
    setReports(rs => rs.map(r => r.id === reportId ? { ...r, assigned_crew_id: crewId, status: 'assigned' } : r))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1E3A2F' }}>Reports Manager</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#666" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #e0d9cc', borderRadius: '0.5rem', fontSize: '0.875rem', background: 'white', fontFamily: 'Lato, sans-serif' }}>
              <option value="all">All</option>
              {['pending', 'assigned', 'in_progress', 'resolved', 'rejected'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: '1rem' }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                {r.photo_url && <img src={r.photo_url} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.0625rem', color: '#1E3A2F' }}>{r.waste_type}</h3>
                    <span style={{ background: `${STATUS_COLORS[r.status]}20`, color: STATUS_COLORS[r.status], padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', color: '#777', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{r.ward}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} />{new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ fontWeight: 700, textTransform: 'capitalize', color: r.severity === 'critical' ? '#C0392B' : r.severity === 'high' ? '#E74C3C' : '#888' }}>⚠ {r.severity}</span>
                  </div>
                  {r.description && <p style={{ color: '#888', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{r.description}</p>}
                </div>
                {/* Admin actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 180 }}>
                  <select onChange={e => e.target.value && assignCrew(r.id, e.target.value)} value={r.assigned_crew_id || ''}
                    style={{ padding: '0.5rem', border: '1.5px solid #e0d9cc', borderRadius: '0.5rem', fontSize: '0.8125rem', fontFamily: 'Lato, sans-serif', background: 'white' }}>
                    <option value="">Assign crew...</option>
                    {crews.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                  <select onChange={e => e.target.value && updateStatus(r.id, e.target.value)} value={r.status}
                    style={{ padding: '0.5rem', border: '1.5px solid #e0d9cc', borderRadius: '0.5rem', fontSize: '0.8125rem', fontFamily: 'Lato, sans-serif', background: 'white' }}>
                    {['pending', 'assigned', 'in_progress', 'resolved', 'rejected'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  {r.status === 'resolved' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#27AE60', fontSize: '0.75rem', fontWeight: 700 }}>
                      <CheckCircle size={14} /> Cleanup verified
                    </div>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#999' }}>No reports found</div>}
          </div>
        )}
      </main>
    </div>
  )
}
