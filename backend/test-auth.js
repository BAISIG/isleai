// test-auth.js (in C:\Users\their\Documents\baisigreact\backend)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://lgurtucciqvwgjaphdqp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk');
async function getToken() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123',
  });
  if (error) {
    console.error('Auth error:', error);
    return;
  }
  console.log('Access Token:', data.session.access_token);
  console.log('User ID:', data.user.id);
}
getToken();