const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emiyuajhjltvjwueovzb.supabase.co';
const supabaseKey = 'sb_publishable_yhgPuSYCZP-8LlfWId8G6A_V13uB8ci';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Sign in as the student to pass RLS self-update policy
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'teststudent@gmail.com',
    password: 'password123'
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  console.log('Logged in as student successfully. UID:', auth.user.id);

  // Update own profile to set tanggal_selesai in the past
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      tanggal_mulai: '2026-04-01',
      tanggal_selesai: '2026-06-15' // Finished
    })
    .eq('id', auth.user.id);

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Successfully updated own student profile to ended on 2026-06-15.');
  }
}

run();
