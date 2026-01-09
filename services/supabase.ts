import { createClient } from '@supabase/supabase-js';

// Ambil dari ENV Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Validasi defensif (opsional tapi sangat dianjurkan)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL atau Anon Key tidak ditemukan. Pastikan file .env sudah benar.'
  );
}

// Buat client Supabase
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
