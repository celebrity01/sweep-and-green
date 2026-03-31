import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'resident' | 'crew' | 'lga_admin' | 'super_admin'

export interface UserProfile {
  id: string
  phone: string
  full_name: string
  lga: string
  ward: string
  role: UserRole
  green_points: number
  referral_code: string
  avatar_url?: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string | null
  photo_url: string
  waste_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  latitude: number
  longitude: number
  address_string: string
  lga: string
  ward: string
  description: string
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected'
  assigned_crew_id: string | null
  resolved_at: string | null
  after_photo_url: string | null
  is_anonymous: boolean
  created_at: string
}

export interface PointsTransaction {
  id: string
  user_id: string
  points: number
  reason: string
  reference_id: string | null
  created_at: string
}

export interface Redemption {
  id: string
  user_id: string
  reward_type: string
  points_spent: number
  status: 'pending' | 'processing' | 'delivered' | 'failed'
  phone_number: string | null
  bank_account: { bank_code: string; account_number: string } | null
  created_at: string
}
