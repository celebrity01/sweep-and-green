import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { Trophy, Star, MapPin } from 'lucide-react'

interface LeaderEntry { full_name: string; lga: string; ward: string; report_count: number; green_points: number }

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState<'ward' | 'lga'>('lga')

  useEffect(() => {
    // Get top reporters by counting reports this month
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
    supabase.from('reports').select('reporter_id, users!reporter_id(full_name, lga, ward, green_points)')
      .gte('created_at', monthStart.toISOString()).not('reporter_id', 'is', null)
      .then(({ data }) => {
        if (!data) { setLoading(false); return }
        const counts: Record<string, { info: { full_name: string; lga: string; ward: string; green_points: number }; count: number }> = {}
        for (const r of data as unknown as { reporter_id: string; users: { full_name: string; lga: string; ward: string; green_points: number } }[]) {
          if (!r.reporter_id || !r.users) continue
          if (!counts[r.reporter_id]) counts[r.reporter_id] = { info: r.users, count: 0 }
          counts[r.reporter_id].count++
        }
        const sorted = Object.values(counts).map(({ info, count }) => ({ ...info, report_count: count })).sort((a, b) => b.report_count - a.report_count).slice(0, 10)
        setLeaders(sorted); setLoading(false)
      })
  }, [])

  const MEDAL_COLORS = ['#C9A84C', '#b0b8c1', '#cd7f32']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#1E3A2F' }}>Leaderboard 🏆</h1>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>Top reporters this month</p>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {(['lga', 'ward'] as const).map(s => (
              <button key={s} onClick={() => setScope(s)} style={{ padding: '0.5rem 1rem', borderRadius: '999px', border: 'none', background: scope === s ? '#1E3A2F' : '#e8e0d0', color: scope === s ? 'white' : '#555', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', minHeight: 'auto', textTransform: 'capitalize' }}>
                By {s}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 podium */}
        {!loading && leaders.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {[1, 0, 2].map(idx => (
              <div key={idx} style={{ textAlign: 'center', flex: idx === 0 ? 1.2 : 1 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: idx === 0 ? '2.25rem' : '1.5rem' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ width: idx === 0 ? 64 : 52, height: idx === 0 ? 64 : 52, borderRadius: '50%', background: `linear-gradient(135deg, ${MEDAL_COLORS[idx]}, ${MEDAL_COLORS[idx]}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.375rem auto', fontSize: idx === 0 ? '1.5rem' : '1.125rem', boxShadow: `0 4px 16px ${MEDAL_COLORS[idx]}50` }}>
                  {leaders[idx].full_name?.charAt(0)}
                </div>
                <div style={{ fontWeight: 700, color: '#1E3A2F', fontSize: idx === 0 ? '1rem' : '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {leaders[idx].full_name?.split(' ')[0]}
                </div>
                <div style={{ color: '#888', fontSize: '0.75rem' }}>{leaders[idx].report_count} reports</div>
                <div style={{ background: idx === 0 ? '#1E3A2F' : '#e8e0d0', color: idx === 0 ? '#C9A84C' : '#666', borderRadius: '999px', padding: '0.15rem 0.625rem', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', marginTop: '0.25rem' }}>
                  #{idx === 1 ? 2 : idx === 0 ? 1 : 3}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {leaders.map((l, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: i === 0 ? 'linear-gradient(135deg, #1E3A2F, #2E5845)' : 'white' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: 800, color: i === 0 ? '#C9A84C' : i < 3 ? MEDAL_COLORS[i] : '#ccc', minWidth: 32, textAlign: 'center' }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? 'rgba(201,168,76,0.2)' : '#f0e9d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: i === 0 ? '#C9A84C' : '#1E3A2F', flexShrink: 0 }}>
                  {l.full_name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: i === 0 ? 'white' : '#1E3A2F' }}>{l.full_name}</div>
                  <div style={{ fontSize: '0.8rem', color: i === 0 ? 'rgba(255,255,255,0.6)' : '#999', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={11} />{l.ward}, {l.lga}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: i === 0 ? '#C9A84C' : '#1E3A2F', fontSize: '1.0625rem' }}>{l.report_count}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', color: i === 0 ? 'rgba(255,255,255,0.6)' : '#aaa', fontSize: '0.75rem' }}>
                    <Star size={10} fill="currentColor" />{l.green_points.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && leaders.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#999' }}>
            <Trophy size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p>No reports this month yet. Be the first on the board!</p>
          </div>
        )}
      </main>
    </div>
  )
}
