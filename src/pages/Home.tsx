import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, MapPin, Star, Users, Truck, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return <>{count.toLocaleString()}</>
}

export default function Home() {
  const [stats, setStats] = useState({ total_reports: 847, resolved: 612, active_wards: 34, kg_removed: 18750 })

  useEffect(() => {
    async function loadStats() {
      const { count: totalReports } = await supabase.from('reports').select('*', { count: 'exact', head: true })
      const { count: resolvedCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved')
      if (totalReports !== null) setStats(s => ({ ...s, total_reports: totalReports, resolved: resolvedCount || 0 }))
    }
    loadStats().catch(() => {}) // Use fallback stats on error
  }, [])

  const steps = [
    { icon: MapPin, step: '01', title: 'Spot Waste', desc: 'See waste in your neighbourhood? Open the app, take a photo and tap Report. Takes under 60 seconds.' },
    { icon: Truck, step: '02', title: 'Crew Dispatch', desc: 'LGA-assigned cleanup crews receive an instant WhatsApp alert with your location and map pin.' },
    { icon: Star, step: '03', title: 'Earn Green Points', desc: 'Every report earns you 50 pts. When cleaned up, earn 100 pts more. Redeem for airtime, data or cash.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1E3A2F 0%, #2E5845 40%, #1a3328 100%)',
        color: 'white',
        padding: '5rem 1.5rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, background: 'rgba(201,168,76,0.12)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, background: 'rgba(39,174,96,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '999px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
            <Leaf size={14} color="#C9A84C" />
            <span style={{ color: '#C9A84C', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em' }}>SOKOTO STATE ENVIRONMENTAL INITIATIVE</span>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,6vw,3.25rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Report Waste. <span style={{ color: '#C9A84C' }}>Earn Rewards.</span><br />Keep Sokoto Clean.
          </h1>

          <p style={{ fontSize: 'clamp(1rem,3vw,1.125rem)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Join thousands of Sokoto residents turning waste sightings into organized cleanups — and earning Green Points along the way.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-gold" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Start Reporting <ArrowRight size={18} />
            </Link>
            <Link to="/map" className="btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              View Live Map <MapPin size={18} />
            </Link>
          </div>

          {/* WhatsApp CTA */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
            <MessageCircle size={16} color="#25D366" />
            <span>Crew alerts delivered via WhatsApp — no extra app needed</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: '#1E3A2F', padding: '0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 0 }}>
          {[
            { label: 'Reports Filed', value: stats.total_reports, suffix: '+' },
            { label: 'Cleanups Done', value: stats.resolved, suffix: '+' },
            { label: 'Active Wards', value: stats.active_wards, suffix: '' },
            { label: 'Waste Removed', value: stats.kg_removed, suffix: 'kg' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '1.5rem', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 800, color: '#C9A84C' }}>
                <AnimatedCounter target={stat.value} />{stat.suffix}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.15rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 1.5rem', background: '#FAF6EE' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>How It Works</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, color: '#1E3A2F', marginTop: '0.5rem' }}>
              From Report to Clean in 3 Steps
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {steps.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card" style={{ textAlign: 'center', border: '1px solid rgba(30,58,47,0.08)', transition: 'transform 0.25s, box-shadow 0.25s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(30,58,47,0.12)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Icon size={28} color="#C9A84C" />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Step {step}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.375rem', fontWeight: 700, color: '#1E3A2F', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ color: '#555', lineHeight: 1.7, fontSize: '0.9375rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards teaser */}
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#27AE60', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Green Points Rewards</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.75rem,4vw,2.375rem)', fontWeight: 700, color: '#1E3A2F', margin: '0.5rem 0 1.25rem' }}>
              Your Reports Have Real Value
            </h2>
            <p style={{ color: '#555', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Every waste report earns you <strong style={{ color: '#C9A84C' }}>50 Green Points</strong>. When the cleanup happens, you earn 100 more. Redeem for real rewards — no tricks, no waiting.
            </p>
            {[
              '₦100 MTN/Airtel Airtime — 500 pts',
              '1GB Data Bundle — 1,000 pts',
              '₦500 POS Cash Transfer — 2,000 pts',
              '₦1,000 POS Cash Transfer — 3,500 pts',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                <CheckCircle size={18} color="#27AE60" />
                <span style={{ fontSize: '0.9375rem', color: '#333' }}>{item}</span>
              </div>
            ))}
            <Link to="/register" className="btn-primary" style={{ marginTop: '1.5rem' }}>
              Join & Start Earning <Star size={16} />
            </Link>
          </div>
          {/* Visual */}
          <div style={{ background: 'linear-gradient(135deg, #1E3A2F 0%, #2E5845 100%)', borderRadius: '1.5rem', padding: '2.5rem', textAlign: 'center', color: 'white' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(201,168,76,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'pulse-gold 2s infinite' }}>
              <Star size={40} color="#C9A84C" fill="#C9A84C" />
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', fontWeight: 800, color: '#C9A84C' }}>2,750</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Average monthly points earned</div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {['📱', '📶', '💵'].map((emoji, i) => (
                <div key={i} style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{emoji}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #a8893c 100%)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Users size={40} color="#1E3A2F" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 800, color: '#1E3A2F', marginBottom: '0.75rem' }}>
            Sokoto ke namu. Let's keep it clean.
          </h2>
          <p style={{ color: 'rgba(30,58,47,0.8)', marginBottom: '2rem', fontSize: '1rem' }}>
            Join your neighbours in making Sokoto State cleaner, one report at a time.
          </p>
          <Link to="/register" className="btn-primary" style={{ background: '#1E3A2F', fontSize: '1.0625rem', padding: '0.9375rem 2.5rem' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
