/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  codingo: {
    platform: string
    authStorage: {
      get(): Promise<string | null>
      set(value: string): Promise<void>
      remove(): Promise<void>
    }
  }
}
