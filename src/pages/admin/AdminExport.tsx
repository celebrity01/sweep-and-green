import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { Download, FileText } from 'lucide-react'
import { useState } from 'react'

export default function AdminExport() {
  const { profile } = useAuth()
  const [exporting, setExporting] = useState(false)

  async function exportCSV() {
    if (!profile) return
    setExporting(true)
    const { data } = await supabase.from('reports').select('id,waste_type,severity,status,ward,lga,address_string,description,created_at,resolved_at,is_anonymous').eq('lga', profile.lga).order('created_at', { ascending: false })
    if (!data) { setExporting(false); return }

    const headers = ['ID', 'Waste Type', 'Severity', 'Status', 'Ward', 'LGA', 'Address', 'Description', 'Reported At', 'Resolved At', 'Anonymous']
    const rows = data.map(r => [
      r.id, r.waste_type, r.severity, r.status, r.ward, r.lga, r.address_string || '', (r.description || '').replace(/,/g, ';'),
      new Date(r.created_at).toLocaleDateString('en-NG'),
      r.resolved_at ? new Date(r.resolved_at).toLocaleDateString('en-NG') : '',
      r.is_anonymous ? 'Yes' : 'No',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `sweep-green-${profile.lga.replace(/ /g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    setExporting(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 700, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#1E3A2F', marginBottom: '0.375rem' }}>Export Reports</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Download report summaries for ministry submission or records.</p>

        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FileText size={32} color="#C9A84C" />
          </div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.375rem', color: '#1E3A2F', marginBottom: '0.5rem' }}>All Reports — {profile?.lga}</h3>
          <p style={{ color: '#666', fontSize: '0.9375rem', marginBottom: '2rem' }}>
            Exports all waste reports for your LGA as a CSV file including ward, severity, status, dates, and location.
          </p>
          <button onClick={exportCSV} disabled={exporting} className="btn-primary" style={{ fontSize: '1rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center', opacity: exporting ? 0.7 : 1 }}>
            <Download size={18} /> {exporting ? 'Preparing download...' : 'Download CSV'}
          </button>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '1.25rem' }}>For PDF export, open the CSV in Google Sheets and print as PDF for ministry submission.</p>
        </div>
      </main>
    </div>
  )
}
