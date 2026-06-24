const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emiyuajhjltvjwueovzb.supabase.co';
const supabaseKey = 'sb_publishable_yhgPuSYCZP-8LlfWId8G6A_V13uB8ci';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin.kesbangpol@presenz.com',
    password: 'adminKesbangpol123!'
  });

  const { data: student, error } = await supabase
    .from('profiles')
    .select('id, nama_lengkap, tanggal_mulai, tanggal_selesai')
    .eq('id', '5c4fa488-5939-4d45-b986-2da3831c7f1a')
    .single();

  console.log('Test Student in DB:', student);
}

run();
