const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co'; // Ваш Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY
'; // Ваш Anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase initialized:', supabase);

