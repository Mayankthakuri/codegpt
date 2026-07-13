import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvpfmestblahyjkruxg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dnBmbWVzdGJsYWh5amtydXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTgzMjYsImV4cCI6MjA5OTQzNDMyNn0.fZefNqR1H_VvH9vY__NvY3aXo6qDU9SYOBlZgNaR5d8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
