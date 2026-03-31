import { useEffect, useState } from 'react'
import { supabase, Report } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { MapPin, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

const SEVERITY_COLORS: Record<string, string> = {
  low: '#27AE60', medium: '#E67E22', high: '#E74C3C', critical: '#C0392B'
}

export default function PublicMap() {
  const [reports, setReports] = useState<Report[]>([])
  const [selected, setSelected] = useState<Report | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(200)
      if (filter === 'active') q = q.in('status', ['pending', 'assigned', 'in_progress'])
      if (filter === 'resolved') q = q.eq('status', 'resolved')
      const { data } = await q
      setReports(data as Report[] || [])
      setLoading(false)
    }
    load().catch(() => { setReports([]); setLoading(false) })
  }, [filter])

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: '#1E3A2F', padding: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700 }}>🗺 Live Waste Map — Sokoto State</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{reports.length} reports shown</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'active', 'resolved'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.3)', background: filter === f ? '#C9A84C' : 'transparent', color: filter === f ? '#1E3A2F' : 'white', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', minHeight: 'auto', textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 500 }}>
          {/* Map area */}
          <div style={{ flex: 1, position: 'relative', background: '#e8f0ec' }}>
            {mapsKey && mapsKey !== 'your_google_maps_key' ? (
              <iframe
                title="Waste Map"
                width="100%" height="100%"
                style={{ border: 'none', minHeight: 500 }}
                src={`https://www.google.com/maps/embed/v1/view?key=${mapsKey}&center=13.0642,5.2339&zoom=12`}
              />
            ) : (
              /* OSM Fallback */
              <div style={{ width: '100%', height: '100%', minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0ece3', position: 'relative' }}>
                <iframe
                  title="OpenStreetMap Fallback"
                  width="100%" height="100%"
                  style={{ border: 'none', minHeight: 500, position: 'absolute', inset: 0 }}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=5.1,12.9,5.4,13.2&layer=mapnik&marker=13.0642,5.2339"
                />
                <div style={{ position: 'absolute', top: 16, left: 16, background: 'white', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10 }}>
                  📍 Add Google Maps API key for heatmap view
                </div>
              </div>
            )}

            {/* Report pins overlay */}
            {loading && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'white', padding: '0.625rem 1rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '0.875rem', color: '#666' }}>
                Loading reports...
              </div>
            )}
          </div>

          {/* Sidebar — report list */}
          <div style={{ width: 320, background: 'white', borderLeft: '1px solid #e8e0d0', overflowY: 'auto', maxHeight: '70vh' }}>
            {/* Legend */}
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f0e9d8', background: '#faf6ee' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Severity Legend</div>
              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
                  <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: '#555' }}>{sev}</span>
                  </div>
                ))}
              </div>
            </div>

            {reports.length === 0 && !loading && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                <MapPin size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p>No reports found</p>
              </div>
            )}

            {reports.map(r => (
              <div key={r.id} onClick={() => setSelected(selected?.id === r.id ? null : r)}
                style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f0e9d8', cursor: 'pointer', background: selected?.id === r.id ? '#f0faf4' : 'white', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLORS[r.severity] || '#888', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E3A2F' }}>{r.waste_type}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: r.status === 'resolved' ? '#27AE60' : '#E67E22', fontWeight: 700, textTransform: 'uppercase' }}>{r.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#777', fontSize: '0.8rem' }}>
                  <MapPin size={12} />
                  <span>{r.ward}, {r.lga}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#aaa', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  <Clock size={11} />
                  {new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected report detail */}
        {selected && (
          <div style={{ background: '#1E3A2F', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {selected.photo_url && (
              <img src={selected.photo_url} alt="waste" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: '0.625rem', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{ background: SEVERITY_COLORS[selected.severity], color: 'white', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>{selected.severity}</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem' }}>{selected.status}</span>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{selected.waste_type}</h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>{selected.ward}, {selected.lga}</p>
              {selected.description && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.825rem', marginTop: '0.375rem' }}>{selected.description}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: selected.status === 'resolved' ? '#2ECC71' : '#C9A84C' }}>
              {selected.status === 'resolved' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'capitalize' }}>{selected.status.replace('_', ' ')}</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
