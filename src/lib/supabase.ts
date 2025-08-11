import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwmvxvqrjhhqxjckacxf.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE' // You need to get this from your Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey)