import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: Substitua estas credenciais pelas suas do Supabase
// Acesse: https://supabase.com/dashboard
// Updated: 2025-11-17 - Force build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvukdcbvqweechmawdac.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dWtkY2J2cXdlZWNobWF3ZGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjI5MjQsImV4cCI6MjA3ODY5ODkyNH0.RTWzj2biQV8-81JN714zkcrPUUq0yQBcPpgLG3ZdyF4'

// Configurações para lidar melhor com refresh token e sessões
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'cyberlife-auth-token',
    flowType: 'pkce'
  }
})
