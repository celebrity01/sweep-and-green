import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Leaf, Target, Users, Globe, Award } from 'lucide-react'

export default function About() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, #1E3A2F 0%, #2E5845 100%)', padding: '4rem 1.5rem 3rem', color: 'white', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, background: 'rgba(201,168,76,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <Leaf size={30} color="#C9A84C" />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,5vw,2.75rem)', fontWeight: 800, marginBottom: '0.75rem' }}>About Sweep & Green</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 560, margin: '0 auto', fontSize: '1.0625rem', lineHeight: 1.75 }}>
          A community-driven environmental action platform built for the people of Sokoto State, Nigeria.
        </p>
      </div>

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem' }}>
        {/* Mission */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#1E3A2F', marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ color: '#444', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
            Sweep & Green was created to bridge a critical gap in Sokoto State's waste management system. Residents had no easy way to report waste issues to authorities. LGAs had no real-time visibility into waste hotspots. Cleanup crews lacked digital coordination tools.
          </p>
          <p style={{ color: '#444', lineHeight: 1.8, fontSize: '1rem' }}>
            We built this platform to connect all three — turning passive waste observation into organized, incentivized civic action through a single, accessible digital platform.
          </p>
        </section>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          {[
            { icon: Target, title: 'Community-Led', desc: 'Residents are the frontline. Every report moves us closer to a cleaner Sokoto.' },
            { icon: Users, title: 'LGA-Enabled', desc: 'Local Government Authorities have full data visibility and crew dispatch tools.' },
            { icon: Globe, title: 'Sokoto-First', desc: 'All 18 LGAs covered. Hausa language support. Designed for slow mobile networks.' },
            { icon: Award, title: 'Incentivized', desc: 'Green Points create a self-sustaining loop — reporters earn real rewards.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card" style={{ border: '1px solid rgba(30,58,47,0.08)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                <Icon size={22} color="#C9A84C" />
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#1E3A2F', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Context */}
        <section style={{ background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '1.25rem', padding: '2.5rem', color: 'white', marginBottom: '3.5rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.625rem', marginBottom: '1rem', color: '#C9A84C' }}>Sokoto's Environmental Challenge</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Sokoto State faces significant waste management challenges driven by rapid urbanisation, population growth, and limited formal waste collection infrastructure. Open dumping is common in many wards, creating health hazards and contributing to blocked drainage and flooding.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
            Sweep & Green is part of the 3MTT (Three Million Technical Talent) programme initiative to leverage technology for civic impact. Our platform is built specifically for Sokoto's context — low-bandwidth mobile devices, Hausa-speaking communities, and LGA-level governance structure.
          </p>
        </section>

        {/* Builder */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #C9A84C, #a8893c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>🌿</div>
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#1E3A2F' }}>Built by Sani (Dabiwa)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>3MTT NextGen Fellow — FE/23/71380770 · Sokoto State, Nigeria</p>
            <p style={{ color: '#555', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Developed as part of the 3MTT programme to provide Sokoto communities with accessible environmental reporting tools.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
