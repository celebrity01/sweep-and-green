import { supabase } from './supabase'

export async function awardPoints(
  userId: string,
  points: number,
  reason: string,
  referenceId?: string
): Promise<boolean> {
  const { error: txError } = await supabase.from('points_transactions').insert({
    user_id: userId,
    points,
    reason,
    reference_id: referenceId || null,
  })
  if (txError) { console.error('Points transaction failed:', txError); return false }

  const { error: updateError } = await supabase.rpc('increment_points', {
    user_id_param: userId,
    points_param: points,
  })
  if (updateError) {
    // Fallback: manual update
    const { data: user } = await supabase.from('users').select('green_points').eq('id', userId).single()
    if (user) {
      await supabase.from('users').update({ green_points: user.green_points + points }).eq('id', userId)
    }
  }
  return true
}

export async function deductPoints(
  userId: string,
  points: number,
  reason: string,
  referenceId?: string
): Promise<boolean> {
  const { data: user } = await supabase.from('users').select('green_points').eq('id', userId).single()
  if (!user || user.green_points < points) return false

  const { error: txError } = await supabase.from('points_transactions').insert({
    user_id: userId,
    points: -points,
    reason,
    reference_id: referenceId || null,
  })
  if (txError) return false

  await supabase.from('users').update({ green_points: user.green_points - points }).eq('id', userId)
  return true
}
