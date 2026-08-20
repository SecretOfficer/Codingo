import { supabase } from './auth'

const LOCAL_KEY = 'codingo:level-1'

/** Read the local cache (always available, even offline). */
export function readLocal(): string[] {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '["variables"]') as string[]
}

/** Write to the local cache. */
export function writeLocal(ids: string[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids))
}

/** Fetch the remote progress row for the signed-in user. */
async function fetchRemote(): Promise<string[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('learning_progress')
    .select('completed_lesson_ids')
    .single()
  if (error || !data) return null
  return data.completed_lesson_ids as string[]
}

/** Push a completed-lesson array to Supabase. */
async function pushRemote(ids: string[]): Promise<void> {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('learning_progress')
    .upsert(
      { user_id: user.id, completed_lesson_ids: ids, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

/**
 * Load progress by merging local cache and remote state.
 * The union of both is kept so no completion is ever lost.
 */
export async function loadProgress(): Promise<string[]> {
  const local = readLocal()
  const remote = await fetchRemote()
  if (!remote) return local

  // Merge: keep the union of both sides so nothing is lost.
  const merged = [...new Set([...local, ...remote])]
  writeLocal(merged)
  // Push the merged set back so the server is also up-to-date.
  if (merged.length > remote.length) {
    await pushRemote(merged)
  }
  return merged
}

/**
 * Mark a lesson complete ΓÇö writes to both localStorage and Supabase.
 * Returns the new completed array.
 */
export async function markComplete(current: string[], lessonId: string): Promise<string[]> {
  if (current.includes(lessonId)) return current
  const next = [...current, lessonId]
  writeLocal(next)
  await pushRemote(next)
  return next
}
