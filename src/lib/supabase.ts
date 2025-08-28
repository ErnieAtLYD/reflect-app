import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

// Environment variables validation
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // During build time, environment variables might not be available
  // Only throw an error if we're in runtime and not building
  if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'test') {
    console.warn(
      'Missing Supabase environment variables. Feedback features will not work.'
    )
  }
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // No user authentication needed for anonymous feedback
    },
    db: {
      schema: 'public',
    },
  }
)

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
