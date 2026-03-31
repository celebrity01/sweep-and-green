interface DispatchData {
  location: string
  severity: string
  wasteType: string
  photoUrl: string
  mapsUrl: string
  crewPhone: string
}

// WhatsApp Business API dispatch via Twilio or 360Dialog
export async function sendDispatchAlert(data: DispatchData): Promise<boolean> {
  const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL
  const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY

  if (!apiUrl || apiUrl === 'your_twilio_or_360dialog_url') {
    // Development stub — log to console
    console.log('📱 [WhatsApp Stub] Dispatch alert would be sent:')
    console.log(`To: ${data.crewPhone}`)
    console.log(`📍 Location: ${data.location}`)
    console.log(`⚠ Severity: ${data.severity.toUpperCase()}`)
    console.log(`🗑 Type: ${data.wasteType}`)
    return true
  }

  const message = `🚨 NEW CLEANUP JOB — Sweep & Green
📍 Location: ${data.location}
⚠ Severity: ${data.severity.toUpperCase()}
🗑 Type: ${data.wasteType}
📸 Photo: ${data.photoUrl}
🗺 Map Pin: ${data.mapsUrl}

Reply ACCEPT to confirm or DECLINE to reject.`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ to: `whatsapp:+234${data.crewPhone.slice(1)}`, body: message }),
    })
    return response.ok
  } catch (err) {
    console.error('WhatsApp dispatch failed:', err)
    return false
  }
}
