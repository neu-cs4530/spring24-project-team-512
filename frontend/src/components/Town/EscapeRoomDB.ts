import { createClient } from '@supabase/supabase-js';
import assert from 'assert';
import { Database } from './supabase';

const SUPABASE_URL = 'https://jjsnoqvsmfkosiflnlgl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc25vcXZzbWZrb3NpZmxubGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2OTcwNzEsImV4cCI6MjAyODI3MzA3MX0.ksiNk2RxF5n-eFAt3lN_qQE0mfQ15O7H6-Xh2U6nX8Y';

assert(SUPABASE_URL, 'supabase url must be defined');
assert(SUPABASE_ANON_KEY, 'supabase anon key must be defined');

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getAllRows() {
  const { data } = await supabase
    .from('escape room leaderboard')
    .select('*')
    .order('completion_time')
    .limit(10);

  return data;
}

export async function addTime(covey_name: string, time: number) {
  const { data } = await supabase
    .from('escape room leaderboard')
    .insert({ covey_name, completion_time: time })
    .single();
  return data;
}
