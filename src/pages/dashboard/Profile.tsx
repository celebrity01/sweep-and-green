import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SOKOTO_LGA_NAMES, SOKOTO_LGAS } from '../../lib/constants'
import Navbar from '../../components/Navbar'
import { User, Save, CheckCircle } from 'lucide-react'

export default function Profile() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [lga, setLga] = useState(profile?.lga || '')
  const [ward, setWard] = useState(profile?.ward || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const wards = lga ? SOKOTO_LGAS[lga] || [] : []

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase.from('users').update({ full_name: fullName, lga, ward }).eq('id', profile.id)
    await refreshProfile()
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 600, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#1E3A2F', marginBottom: '1.75rem' }}>My Profile</h1>

        {/* Avatar & referral */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={30} color="#C9A84C" />
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1E3A2F', fontWeight: 700 }}>{profile?.full_name}</div>
            <div style={{ color: '#888', fontSize: '0.875rem' }}>{profile?.phone} · {profile?.role}</div>
            <div style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#C9A84C', fontWeight: 700 }}>
              Referral code: <span style={{ background: '#1E3A2F', color: '#C9A84C', padding: '0.15rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.8125rem' }}>{profile?.referral_code}</span>
            </div>
          </div>
        </div>

        {saved && (
          <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065F46', fontSize: '0.875rem' }}>
            <CheckCircle size={16} /> Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.125rem', color: '#1E3A2F', marginBottom: '0.25rem' }}>Edit Profile</h3>

          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#1E3A2F'} onBlur={e => e.target.style.borderColor = '#e0d9cc'} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Phone (read-only)</label>
            <input type="text" value={profile?.phone || ''} disabled style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', background: '#f5f0e8', color: '#999' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>LGA</label>
              <select value={lga} onChange={e => { setLga(e.target.value); setWard('') }}
                style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '0.9375rem', fontFamily: 'Lato, sans-serif', appearance: 'none', background: 'white' }}>
                <option value="">Select LGA</option>
                {SOKOTO_LGA_NAMES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Ward</label>
              <select value={ward} onChange={e => setWard(e.target.value)} disabled={!lga}
                style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '0.9375rem', fontFamily: 'Lato, sans-serif', appearance: 'none', background: lga ? 'white' : '#f5f0e8' }}>
                <option value="">{lga ? 'Select ward' : 'LGA first'}</option>
                {wards.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  )
}
