// 1. THIS MUST BE THE VERY FIRST LINE
import 'react-native-url-polyfill/auto'; 

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 2. Read the keys
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 3. Debug Logs (Check your terminal when you run this!)
console.log("--- SUPABASE CONFIG ---");
console.log("URL Exists:", !!supabaseUrl); // Should say true
console.log("Key Exists:", !!supabaseAnonKey); // Should say true
console.log("-----------------------");

// 4. Prevent Crash if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL ERROR: Supabase keys are missing from .env file.");
  // We throw an error to stop execution so you know exactly what's wrong
  throw new Error("Supabase keys missing. Check .env file."); 
}

// 5. Initialize
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});