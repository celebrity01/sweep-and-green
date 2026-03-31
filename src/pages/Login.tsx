import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Leaf, Phone, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (phone.length !== 11) { setError('Enter a valid 11-digit phone number'); return }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        phone: `+234${phone.slice(1)}`,
        password,
      })
      if (authError) throw authError
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1E3A2F 0%, #2E5845 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', justifyContent: 'center', marginBottom: '2rem', textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, background: '#C9A84C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={24} color="#1E3A2F" />
          </div>
          <span style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.4rem' }}>Sweep & Green</span>
        </Link>

        <div className="card" style={{ borderRadius: '1.25rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.625rem', color: '#1E3A2F', marginBottom: '0.375rem' }}>Welcome Back</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Sign in to your account to continue reporting.</p>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input type="tel" required placeholder="08012345678" maxLength={11} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1E3A2F'} onBlur={e => e.target.style.borderColor = '#e0d9cc'} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input type={showPw ? 'text' : 'password'} required placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '1rem', fontFamily: 'Lato, sans-serif', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1E3A2F'} onBlur={e => e.target.style.borderColor = '#e0d9cc'} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, minHeight: 'auto' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing In...' : 'Sign In 🌿'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#666', fontSize: '0.9rem' }}>
            New to Sweep & Green? <Link to="/register" style={{ color: '#1E3A2F', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#999' }}>
            LGA Admin / Crew? Use the same login — your role determines your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
