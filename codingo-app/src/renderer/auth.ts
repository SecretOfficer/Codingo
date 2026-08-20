/// <reference path="./vite-env.d.ts" />

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && key)

const secureStorage = {
  getItem: (storageKey: string): Promise<string | null> => window.codingo.authStorage.get(),
  setItem: (storageKey: string, value: string): Promise<void> => window.codingo.authStorage.set(value),
  removeItem: (storageKey: string): Promise<void> => window.codingo.authStorage.remove()
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, key as string, { auth: { storage: secureStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null

export type AuthSession = Session

export function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone)
}
