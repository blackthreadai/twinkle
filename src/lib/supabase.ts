import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

const storageOption = Platform.OS === 'web'
  ? { storage: typeof window !== 'undefined' ? window.localStorage : undefined }
  : (() => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return { storage: AsyncStorage };
      } catch {
        return {};
      }
    })();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        ...storageOption,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : (null as any);
