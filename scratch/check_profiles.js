const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emiyuajhjltvjwueovzb.supabase.co';
const supabaseKey = 'sb_publishable_yhgPuSYCZP-8LlfWId8G6A_V13uB8ci'; // Anon key from .env.local

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nama_lengkap, role, nama_kampus, nim_nisn');
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles:', data);
  }
}

run();
