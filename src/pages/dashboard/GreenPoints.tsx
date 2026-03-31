import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, PointsTransaction } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'

const REASON_LABELS: Record<string, string> = {
  report_submitted: '📸 Report submitted',
  report_resolved: '✅ Cleanup verified',
  daily_bonus: '🌅 Daily first report bonus',
  referral: '👥 Referral bonus',
  profile_complete: '👤 Profile completed',
  monthly_top_reporter: '🏆 Monthly top reporter',
  redeemed: '🎁 Reward redeemed',
}

export default function GreenPoints() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('points_transactions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setTransactions(data as PointsTransaction[] || []); setLoading(false) })
  }, [profile])

  const totalEarned = transactions.filter(t => t.points > 0).reduce((sum, t) => sum + t.points, 0)
  const totalSpent = Math.abs(transactions.filter(t => t.points < 0).reduce((sum, t) => sum + t.points, 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        {/* Balance card */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '1.25rem', padding: '2rem', color: 'white', marginBottom: '1.75rem', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, background: 'rgba(201,168,76,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', animation: 'pulse-gold 2s infinite' }}>
            <Star size={30} color="#C9A84C" fill="#C9A84C" />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Your Balance</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', fontWeight: 800, color: '#C9A84C' }}>{profile?.green_points.toLocaleString() ?? 0}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Green Points</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#2ECC71', fontWeight: 700, fontSize: '1.125rem' }}>+{totalEarned.toLocaleString()}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Total Earned</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#C0392B', fontWeight: 700, fontSize: '1.125rem' }}>-{totalSpent.toLocaleString()}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Total Redeemed</div>
            </div>
          </div>
        </div>

        {/* Earning guide */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#1E3A2F', marginBottom: '1rem' }}>How to Earn Points</h3>
          {[
            { action: 'Submit a waste report with photo', pts: 50 },
            { action: 'First report of the day (daily bonus)', pts: 20 },
            { action: 'Report verified and cleaned up', pts: 100 },
            { action: 'Refer a new user', pts: 200 },
            { action: 'Complete your profile', pts: 100 },
            { action: 'Monthly top reporter (ward)', pts: 500 },
          ].map(({ action, pts }) => (
            <div key={action} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #f0e9d8' }}>
              <span style={{ color: '#444', fontSize: '0.875rem' }}>{action}</span>
              <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.875rem' }}>+{pts} pts</span>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.375rem', color: '#1E3A2F', marginBottom: '1rem' }}>Points History</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <Star size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p>No transactions yet. Start reporting to earn your first points!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {transactions.map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, background: t.points > 0 ? '#f0faf4' : '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.points > 0 ? <TrendingUp size={18} color="#27AE60" /> : <TrendingDown size={18} color="#C0392B" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1E3A2F', fontSize: '0.9rem' }}>{REASON_LABELS[t.reason] || t.reason}</div>
                    <div style={{ color: '#aaa', fontSize: '0.75rem' }}>{new Date(t.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: t.points > 0 ? '#27AE60' : '#C0392B', fontSize: '1.0625rem' }}>
                  {t.points > 0 ? '+' : ''}{t.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
