import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'

const supabaseUrl = 'https://gbctcoaesqsacojrrwvi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiY3Rjb2Flc3FzYWNvanJyd3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODE2NTQsImV4cCI6MjA4NTU1NzY1NH0.l1Pil84oPtKentDVFom6hh5_3KoP2s7aS71j2vU736M'

export const supabase = createClient(supabaseUrl, supabaseKey)
