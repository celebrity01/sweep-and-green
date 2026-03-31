import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#27AE60', '#E67E22', '#E74C3C', '#C0392B']

export default function AdminAnalytics() {
  const { profile } = useAuth()
  const [wardData, setWardData] = useState<{ ward: string; count: number }[]>([])
  const [severityData, setSeverityData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('reports').select('ward, severity, status').eq('lga', profile.lga).then(({ data }) => {
      if (!data) { setLoading(false); return }
      // Ward counts
      const wardMap: Record<string, number> = {}
      const sevMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
      for (const r of data) {
        wardMap[r.ward] = (wardMap[r.ward] || 0) + 1
        if (r.severity in sevMap) sevMap[r.severity]++
      }
      setWardData(Object.entries(wardMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([ward, count]) => ({ ward: ward.split(' ').slice(0, 2).join(' '), count })))
      setSeverityData(Object.entries(sevMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).filter(d => d.value > 0))
      setLoading(false)
    })
  }, [profile])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#1E3A2F', marginBottom: '0.5rem' }}>Analytics — {profile?.lga}</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Waste report patterns and distribution for your LGA</p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
            <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {/* Reports by ward */}
            <div className="card">
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.125rem', color: '#1E3A2F', marginBottom: '1.25rem' }}>Reports by Ward</h3>
              {wardData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={wardData} margin={{ left: -20 }}>
                    <XAxis dataKey="ward" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip contentStyle={{ fontFamily: 'Lato, sans-serif', fontSize: '0.875rem' }} />
                    <Bar dataKey="count" fill="#1E3A2F" radius={[4, 4, 0, 0]} name="Reports" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No data yet</p>}
            </div>

            {/* Severity breakdown */}
            <div className="card">
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.125rem', color: '#1E3A2F', marginBottom: '1.25rem' }}>Severity Breakdown</h3>
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {severityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No data yet</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
