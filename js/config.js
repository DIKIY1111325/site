// config.js - This file should be kept secure and not committed to the repository
const SUPABASE_CONFIG = {
    url: 'https://dsvaqphuagrnkjmthtet.supabase.co',
    publicAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY'
};

// Only export what's needed for client-side
export const getSupabaseConfig = () => ({
    url: SUPABASE_CONFIG.url,
    publicKey: SUPABASE_CONFIG.publicAnonKey
});