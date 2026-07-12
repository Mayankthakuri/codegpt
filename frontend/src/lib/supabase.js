import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvpfmestblahyjkruxg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dmZtZXN0YmxhaHlqa3J1eGciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MjMzMzIxNywiZXhwIjoyMDY3OTA5MjE3fQ.KCk0gSfF8RvEKQwzS4s3Yk_Jf1mSZ3bPXbCfLqLGH-8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
