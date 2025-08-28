import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

// Environment variables validation
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY are set.'
  )
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No user authentication needed for anonymous feedback
  },
  db: {
    schema: 'public',
  },
})

// Health check function for database connectivity
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('feedback').select('count').limit(1)
    return !error
  } catch {
    return false
  }
}

// Export types for convenience
export type { Database } from '@/types/database'
