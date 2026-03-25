import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ntpeguywzlmhjbjvsnyr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50cGVndXl3emxtaGpianZzbnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTE2MTQsImV4cCI6MjA4ODUyNzYxNH0.qcqOM8BrlOxQOH6FLjPofNKl6y9vOJybBHCKGdKUKD8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});
