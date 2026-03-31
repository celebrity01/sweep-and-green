import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { awardPoints } from '../lib/points'
import { sendDispatchAlert } from '../lib/whatsapp'
import { SOKOTO_LGA_NAMES, SOKOTO_LGAS, WASTE_TYPES, SEVERITY_LEVELS, POINTS_RULES } from '../lib/constants'
import Navbar from '../components/Navbar'
import { Camera, MapPin, Loader2, CheckCircle, Star, Share2, AlertTriangle, X, RefreshCw } from 'lucide-react'

type Step = 'form' | 'submitting' | 'success'

interface OfflineDraft {
  photo_base64: string
  waste_type: string
  severity: string
  lga: string
  ward: string
  description: string
  is_anonymous: boolean
  latitude: number | null
  longitude: number | null
  address_string: string
}

const OFFLINE_KEY = 'sg_offline_report'

export default function ReportWaste() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('form')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [wasteType, setWasteType] = useState('')
  const [severity, setSeverity] = useState('')
  const [lga, setLga] = useState(profile?.lga || '')
  const [ward, setWard] = useState(profile?.ward || '')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [addressStr, setAddressStr] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')
  const [error, setError] = useState('')
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const wards = lga ? SOKOTO_LGAS[lga] || [] : []

  // Listen for online/offline
  window.addEventListener('online', () => {
    setIsOffline(false)
    submitOfflineDraft()
  })
  window.addEventListener('offline', () => setIsOffline(true))

  async function submitOfflineDraft() {
    const raw = localStorage.getItem(OFFLINE_KEY)
    if (!raw || !user) return
    const draft: OfflineDraft = JSON.parse(raw)
    // Convert base64 back to blob
    const res = await fetch(draft.photo_base64)
    const blob = await res.blob()
    const file = new File([blob], 'offline-photo.jpg', { type: 'image/jpeg' })
    await doSubmit(file, draft.waste_type, draft.severity, draft.lga, draft.ward, draft.description, draft.is_anonymous, draft.latitude, draft.longitude, draft.address_string)
    localStorage.removeItem(OFFLINE_KEY)
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Client-side compression to max 800KB
    const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true })
    setPhoto(compressed as unknown as File)
    setPhotoPreview(URL.createObjectURL(compressed))
  }

  const detectLocation = useCallback(() => {
    setLocLoading(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        setLat(latitude)
        setLng(longitude)
        // Reverse geocode
        try {
          const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
          if (mapsKey && mapsKey !== 'your_google_maps_key') {
            const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${mapsKey}`)
            const d = await r.json()
            if (d.results?.[0]) setAddressStr(d.results[0].formatted_address)
          } else {
            // OSM Nominatim fallback
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            const d = await r.json()
            setAddressStr(d.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
          }
        } catch { setAddressStr(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`) }
        setLocLoading(false)
      },
      err => { setLocError('Could not detect location. Please select LGA and ward manually.'); setLocLoading(false); console.log(err) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  async function doSubmit(
    photoFile: File, wType: string, sev: string, lgaV: string, wardV: string, desc: string, anon: boolean, latV: number | null, lngV: number | null, addrStr: string
  ) {
    if (!user) return
    // Upload photo to Supabase Storage
    const ext = photoFile.name.split('.').pop() || 'jpg'
    const path = `reports/${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('report-photos').upload(path, photoFile, { contentType: photoFile.type })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('report-photos').getPublicUrl(path)

    // Insert report
    const { data: report, error: reportError } = await supabase.from('reports').insert({
      reporter_id: anon ? null : user.id,
      photo_url: publicUrl,
      waste_type: wType,
      severity: sev,
      latitude: latV,
      longitude: lngV,
      address_string: addrStr,
      lga: lgaV,
      ward: wardV,
      description: desc,
      status: 'pending',
      is_anonymous: anon,
    }).select().single()
    if (reportError) throw reportError

    // Award base points
    let pts = POINTS_RULES.report_submitted
    await awardPoints(user.id, pts, 'report_submitted', report.id)

    // Daily bonus
    const today = new Date().toDateString()
    const lastBonus = localStorage.getItem('sg_daily_bonus')
    if (lastBonus !== today) {
      await awardPoints(user.id, POINTS_RULES.daily_bonus, 'daily_bonus', report.id)
      pts += POINTS_RULES.daily_bonus
      localStorage.setItem('sg_daily_bonus', today)
    }

    // WhatsApp dispatch
    await sendDispatchAlert({
      location: `${wardV}, ${lgaV}`,
      severity: sev,
      wasteType: wType,
      photoUrl: publicUrl,
      mapsUrl: latV ? `https://maps.google.com/?q=${latV},${lngV}` : 'Location not available',
      crewPhone: '08000000000', // Assigned dynamically in production
    })

    setEarnedPoints(pts)
    await refreshProfile()
    setStep('success')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!photo) { setError('Please take or upload a photo of the waste.'); return }
    if (!wasteType) { setError('Please select the waste type.'); return }
    if (!severity) { setError('Please select the severity level.'); return }
    if (!lga || !ward) { setError('Please select your LGA and ward.'); return }

    setStep('submitting')

    // Offline fallback
    if (isOffline) {
      const base64 = await new Promise<string>(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target?.result as string)
        reader.readAsDataURL(photo)
      })
      const draft: OfflineDraft = { photo_base64: base64, waste_type: wasteType, severity, lga, ward, description, is_anonymous: isAnonymous, latitude: lat, longitude: lng, address_string: addressStr }
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(draft))
      setStep('form')
      setError('📶 No connection — report saved and will auto-submit when you\'re back online.')
      return
    }

    try {
      await doSubmit(photo!, wasteType, severity, lga, ward, description, isAnonymous, lat, lng, addressStr)
    } catch (err: unknown) {
      setStep('form')
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    }
  }

  function shareWhatsApp() {
    const msg = `🌿 I just reported a waste site in ${ward}, ${lga} on Sweep & Green! Help keep Sokoto clean. Download the app: ${window.location.origin}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (step === 'success') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <div className="animate-pulse-gold" style={{ width: 88, height: 88, background: 'linear-gradient(135deg, #27AE60, #2ECC71)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={44} color="white" />
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#1E3A2F', marginBottom: '0.625rem' }}>Report Submitted!</h1>
            <p style={{ color: '#555', marginBottom: '1.75rem', lineHeight: 1.7 }}>
              Your waste report has been filed. A cleanup crew has been notified via WhatsApp.
            </p>

            {/* Points earned */}
            <div style={{ background: 'linear-gradient(135deg, #1E3A2F, #2E5845)', borderRadius: '1rem', padding: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>
              <Star size={28} color="#C9A84C" fill="#C9A84C" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 800, color: '#C9A84C' }}>+{earnedPoints}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Green Points Earned</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Total: {profile?.green_points.toLocaleString()} pts</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={shareWhatsApp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '0.625rem', padding: '0.875rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', minHeight: 44 }}>
                <Share2 size={18} /> Share on WhatsApp
              </button>
              <button onClick={() => { setStep('form'); setPhoto(null); setPhotoPreview(null); setWasteType(''); setSeverity(''); setDescription(''); setLat(null); setLng(null); setAddressStr('') }} className="btn-outline" style={{ width: '100%' }}>
                Report Another
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ width: '100%' }}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'submitting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={52} color="#1E3A2F" style={{ margin: '0 auto 1.25rem', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#1E3A2F', marginBottom: '0.5rem' }}>Submitting Report...</h2>
            <p style={{ color: '#666' }}>Uploading photo and notifying cleanup crew via WhatsApp</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF6EE' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', color: '#1E3A2F', marginBottom: '0.375rem' }}>Report Waste</h1>
          <p style={{ color: '#666', fontSize: '0.9375rem' }}>Spot a waste problem? Report it in under 60 seconds and earn Green Points.</p>
        </div>

        {isOffline && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#92400E' }}>
            <AlertTriangle size={16} /> You're offline. Form data will be saved and submitted automatically when you reconnect.
          </div>
        )}

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#991B1B' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Photo Upload — CRITICAL */}
          <div className="card" style={{ border: '2px dashed #C9A84C', cursor: 'pointer', textAlign: 'center', padding: photoPreview ? '0' : '2rem', overflow: 'hidden', borderRadius: '1rem' }} onClick={() => fileRef.current?.click()}>
            {photoPreview ? (
              <div style={{ position: 'relative' }}>
                <img src={photoPreview} alt="preview" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={e => { e.stopPropagation(); setPhoto(null); setPhotoPreview(null) }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 'auto', color: 'white' }}>
                  <X size={16} />
                </button>
                <div style={{ background: 'rgba(30,58,47,0.85)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'center' }}>
                  <RefreshCw size={14} /> Tap to change photo
                </div>
              </div>
            ) : (
              <>
                <div style={{ width: 72, height: 72, background: 'rgba(201,168,76,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Camera size={36} color="#C9A84C" />
                </div>
                <p style={{ fontWeight: 700, color: '#1E3A2F', marginBottom: '0.25rem' }}>Take a Photo (Required)</p>
                <p style={{ color: '#888', fontSize: '0.875rem' }}>Tap to open camera or choose from gallery. Max 5MB.</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          {/* Waste Type */}
          <div className="card">
            <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', marginBottom: '0.75rem' }}>Waste Type *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {WASTE_TYPES.map(type => (
                <button type="button" key={type} onClick={() => setWasteType(type)}
                  style={{ padding: '0.75rem', border: `2px solid ${wasteType === type ? '#1E3A2F' : '#e0d9cc'}`, borderRadius: '0.625rem', background: wasteType === type ? '#1E3A2F' : 'white', color: wasteType === type ? 'white' : '#333', fontWeight: wasteType === type ? 700 : 400, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s', minHeight: 44, textAlign: 'center' }}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="card">
            <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', marginBottom: '0.75rem' }}>Severity Level *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {SEVERITY_LEVELS.map(({ value, label, color, description }) => (
                <button type="button" key={value} onClick={() => setSeverity(value)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', border: `2px solid ${severity === value ? color : '#e0d9cc'}`, borderRadius: '0.625rem', background: severity === value ? `${color}12` : 'white', cursor: 'pointer', textAlign: 'left', minHeight: 44, transition: 'all 0.15s' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: severity === value ? `0 0 0 3px ${color}30` : 'none' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: severity === value ? color : '#333' }}>{label}</div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.1rem' }}>{description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', marginBottom: '0.75rem' }}>Location *</label>

            {/* GPS Button */}
            <button type="button" onClick={detectLocation} disabled={locLoading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', background: lat ? '#f0faf4' : '#1E3A2F', color: lat ? '#27AE60' : 'white', border: lat ? '2px solid #27AE60' : 'none', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', marginBottom: '1rem', minHeight: 52 }}>
              {locLoading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Detecting location...</> : lat ? <><CheckCircle size={18} /> Location detected — tap to refresh</> : <><MapPin size={18} /> Auto-detect my location (GPS)</>}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {locError && <p style={{ color: '#C0392B', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{locError}</p>}
            {addressStr && <p style={{ color: '#555', fontSize: '0.8125rem', marginBottom: '0.875rem', padding: '0.5rem', background: '#f5f0e8', borderRadius: '0.375rem' }}>📍 {addressStr}</p>}

            {/* LGA + Ward manual */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: '0.35rem' }}>LGA *</label>
                <select required value={lga} onChange={e => { setLga(e.target.value); setWard('') }}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'Lato, sans-serif', background: 'white', appearance: 'none' }}>
                  <option value="">Select LGA</option>
                  {SOKOTO_LGA_NAMES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: '0.35rem' }}>Ward *</label>
                <select required value={ward} onChange={e => setWard(e.target.value)} disabled={!lga}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #e0d9cc', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'Lato, sans-serif', background: lga ? 'white' : '#f5f0e8', appearance: 'none' }}>
                  <option value="">{lga ? 'Select ward' : 'LGA first'}</option>
                  {wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <label style={{ display: 'block', fontWeight: 700, color: '#1E3A2F', marginBottom: '0.5rem' }}>
              Description <span style={{ color: '#999', fontWeight: 400, fontSize: '0.875rem' }}>(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={300} rows={3}
              placeholder="Describe the waste situation — e.g. large pile of household waste blocking the road..." style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e0d9cc', borderRadius: '0.625rem', fontSize: '0.9375rem', fontFamily: 'Lato, sans-serif', resize: 'vertical', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#1E3A2F'} onBlur={e => e.target.style.borderColor = '#e0d9cc'} />
            <p style={{ textAlign: 'right', fontSize: '0.75rem', color: '#aaa', marginTop: '0.25rem' }}>{description.length}/300</p>
          </div>

          {/* Anonymous toggle */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setIsAnonymous(!isAnonymous)}>
            <div>
              <div style={{ fontWeight: 700, color: '#1E3A2F', fontSize: '0.9375rem' }}>Report Anonymously</div>
              <div style={{ color: '#888', fontSize: '0.8125rem', marginTop: '0.15rem' }}>Your identity stays hidden on the public map — but you still earn Green Points.</div>
            </div>
            <div style={{ width: 52, height: 28, borderRadius: '999px', background: isAnonymous ? '#1E3A2F' : '#e0d9cc', transition: 'background 0.2s', flexShrink: 0, position: 'relative' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: isAnonymous ? 27 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>

          {/* Points preview */}
          <div style={{ background: 'rgba(30,58,47,0.05)', border: '1px solid rgba(30,58,47,0.1)', borderRadius: '0.625rem', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Star size={18} color="#C9A84C" fill="#C9A84C" />
            <span style={{ fontSize: '0.875rem', color: '#1E3A2F' }}>
              You'll earn <strong style={{ color: '#C9A84C' }}>50 pts</strong> for this report, and <strong style={{ color: '#C9A84C' }}>+100 pts</strong> more when it's cleaned.
            </span>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '1.0625rem', padding: '1rem', minHeight: 56 }}>
            Submit Report &amp; Earn Points 🌿
          </button>
        </form>
      </main>
    </div>
  )
}
