import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { deductPoints } from '../../lib/points'
import { REWARDS } from '../../lib/constants'
import Navbar from '../../components/Navbar'
import { Star, CheckCircle, Phone, AlertTriangle } from 'lucide-react'

export default function Rewards() {
  const { profile, refreshProfile } = useAuth()
  const [selected, setSelected] = useState<string | null>(null)
  const [phone, setPhone] = useState(profile?.phone || '')
  const [bankCode, setBankCode] = useState('')
  const [accountNum, setAccountNum] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const reward = REWARDS.find(r => r.id === selected)
  const canAfford = reward ? (profile?.green_points || 0) >= reward.points : false

  async function handleRedeem() {
    if (!reward || !profile || !canAfford) return
    setLoading(true); setError(''); setSuccess('')

    const bankAccount = reward.delivery === 'bank_transfer' ? { bank_code: bankCode, account_number: accountNum } : null
    if (reward.delivery === 'bank_transfer' && (!bankCode || !accountNum)) { setError('Please enter your bank details.'); setLoading(false); return }

    const ok = await deductPoints(profile.id, reward.points, 'redeemed')
    if (!ok) { setError('Insufficient points or deduction failed.'); setLoading(false); return }

    await supabase.from('redemptions').insert({
      user_id: profile.id, reward_type: reward.id, points_spent: reward.points, status: 'pending',
      phone_number: phone || null, bank_account: bankAccount,
    })

    await refreshProfile()
    setSuccess(`Your ${reward.label} redemption has been submitted! You'll receive it within 10 minutes.`)
    setSelected(null)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#1E3A2F' }}>Rewards Store</h1>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>Redeem your Green Points for real rewards</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1E3A2F', borderRadius: '999px', padding: '0.5rem 1rem' }}>
            <Star size={16} color="#C9A84C" fill="#C9A84C" />
            <span style={{ color: '#C9A84C', fontWeight: 700 }}>{profile?.green_points.toLocaleString() ?? 0} pts</span>
          </div>
        </div>

        {success && (
          <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#065F46' }}>
            <CheckCircle size={18} /> {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {REWARDS.map(r => {
            const affordable = (profile?.green_points || 0) >= r.points
            return (
              <div key={r.id} className="card" style={{ textAlign: 'center', border: `2px solid ${selected === r.id ? '#C9A84C' : affordable ? 'rgba(30,58,47,0.1)' : '#f0e9d8'}`, opacity: affordable ? 1 : 0.65, transition: 'all 0.2s', cursor: affordable ? 'pointer' : 'not-allowed' }}
                onClick={() => affordable && setSelected(selected === r.id ? null : r.id)}
                onMouseEnter={e => { if (affordable) (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{r.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.0625rem', color: '#1E3A2F', marginBottom: '0.5rem' }}>{r.label}</h3>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 800, color: '#C9A84C', marginBottom: '0.375rem' }}>{r.points.toLocaleString()}</div>
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '1rem' }}>Green Points</div>
                <span style={{ background: affordable ? '#1E3A2F' : '#ddd', color: affordable ? '#C9A84C' : '#999', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {affordable ? (selected === r.id ? '✓ Selected' : 'Select') : 'Need more pts'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Redemption panel */}
        {selected && reward && (
          <div className="card" style={{ marginTop: '2rem', border: '2px solid #C9A84C' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1E3A2F', marginBottom: '1rem' }}>
              Redeem: {reward.label} ({reward.points.toLocaleString()} pts)
            </h3>

            {error && (
              <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            {reward.delivery === 'instant' ? (
              <div>
                <label style={{ fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                  Airtime/Data delivery phone number
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="08012345678" maxLength={11}
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', marginBottom: '1rem', fontFamily: 'Lato, sans-serif', outline: 'none' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontWeight: 700, color: '#1E3A2F', fontSize: '0.8125rem', display: 'block', marginBottom: '0.375rem' }}>Bank Code</label>
                  <input type="text" value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="e.g. 058 (GTB)" maxLength={6}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '0.9375rem', fontFamily: 'Lato, sans-serif', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, color: '#1E3A2F', fontSize: '0.8125rem', display: 'block', marginBottom: '0.375rem' }}>Account Number</label>
                  <input type="text" value={accountNum} onChange={e => setAccountNum(e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" maxLength={10}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '0.9375rem', fontFamily: 'Lato, sans-serif', outline: 'none' }} />
                </div>
              </div>
            )}

            <button onClick={handleRedeem} disabled={loading} className="btn-gold" style={{ width: '100%', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : `Confirm Redemption — ${reward.points.toLocaleString()} pts`}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
