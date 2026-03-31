import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SOKOTO_LGA_NAMES, SOKOTO_LGAS } from '../lib/constants'
import { Leaf, Phone, User, Lock, MapPin, ChevronDown, Eye, EyeOff } from 'lucide-react'

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', phone: '', lga: '', ward: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const wards = form.lga ? SOKOTO_LGAS[form.lga] || [] : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.lga || !form.ward) { setError('Please select your LGA and ward.'); return }
    if (form.phone.length !== 11 || !form.phone.startsWith('0')) { setError('Enter a valid Nigerian phone number (e.g. 08012345678)'); return }

    setLoading(true)
    try {
      // Sign up with Supabase Auth using phone
      const { data: authData, error: authError } = await supabase.auth.signUp({
        phone: `+234${form.phone.slice(1)}`,
        password: form.password,
      })
      if (authError) throw authError

      // Insert user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user?.id,
        phone: form.phone,
        full_name: form.full_name,
        lga: form.lga,
        ward: form.ward,
        role: 'resident',
        green_points: 0,
        referral_code: generateReferralCode(),
      })
      if (profileError) throw profileError

      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1E3A2F 0%, #2E5845 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', justifyContent: 'center', marginBottom: '2rem', textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, background: '#C9A84C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={24} color="#1E3A2F" />
          </div>
          <span style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.4rem' }}>Sweep & Green</span>
        </Link>

        <div className="card" style={{ borderRadius: '1.25rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.625rem', color: '#1E3A2F', marginBottom: '0.375rem' }}>Join Sweep & Green</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Create your resident account and start earning Green Points.</p>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input type="text" required placeholder="e.g. Aminu Usman" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#1E3A2F'} onBlur={e => e.target.style.borderColor = '#e0d9cc'} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input type="tel" required placeholder="08012345678" maxLength={11} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1E3A2F'} onBlur={e => e.target.style.borderColor = '#e0d9cc'} />
              </div>
            </div>

            {/* LGA */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Local Government Area (LGA) *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
                <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
                <select required value={form.lga} onChange={e => setForm(f => ({ ...f, lga: e.target.value, ward: '' }))}
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', appearance: 'none', background: 'white', outline: 'none' }}>
                  <option value="">Select your LGA</option>
                  {SOKOTO_LGA_NAMES.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                </select>
              </div>
            </div>

            {/* Ward */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Ward *</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
                <select required value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} disabled={!form.lga}
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', appearance: 'none', background: form.lga ? 'white' : '#f5f0e8', outline: 'none', color: form.lga ? '#1a1a1a' : '#999' }}>
                  <option value="">{form.lga ? 'Select your ward' : 'Select LGA first'}</option>
                  {wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input type={showPw ? 'text' : 'password'} required minLength={6} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1E3A2F'} onBlur={e => e.target.style.borderColor = '#e0d9cc'} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, minHeight: 'auto' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating Account...' : 'Create Account & Earn 100 pts 🌿'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#666', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#1E3A2F', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
