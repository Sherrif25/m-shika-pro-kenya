import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwmvxvqrjhhqxjckacxf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bXZ4dnFyamhocXhqY2thY3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MDQwMzMsImV4cCI6MjA3MDM4MDAzM30.J-6a41fY5qB7SQbwCDWESYBSGu8uxNQh_GXuOiQjD7k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)