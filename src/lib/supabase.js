import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null;

if (supabaseUrl && supabaseKey) {
    // Singleton pattern to prevent multiple instances during HMR in development
    if (import.meta.env.DEV) {
        if (!window._supabaseInstance) {
            window._supabaseInstance = createClient(supabaseUrl, supabaseKey);
        }
        supabaseInstance = window._supabaseInstance;
    } else {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
} else {
    console.warn('Supabase credentials missing (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)');
}

export const supabase = supabaseInstance;
