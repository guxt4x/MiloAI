import { createClient } from '@supabase/supabase-js';

// Project: miloAI
// ID: krrfziiaueekxieklrvw
const SUPABASE_URL = 'https://krrfziiaueekxieklrvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycmZ6aWlhdWVla3hpZWtscnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzYwMjcsImV4cCI6MjA4MzA1MjAyN30.MddeTAxSnVnHhcogQq0sMNsd6WLQ9du8iXxWmf2wJ7M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
