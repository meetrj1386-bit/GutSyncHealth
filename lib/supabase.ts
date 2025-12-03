import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://ujgwbcxbglypvoztijgo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ3diY3hiZ2x5cHZvenRpamdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDM3NTUsImV4cCI6MjA3OTg3OTc1NX0.26jDi1SoRVUlt3Lt0Y9JGtGzKLNITAfjZ9ORJFGK6aA';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types based on actual schema
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  gender: string | null;
  age_range: string | null;
  date_of_birth: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  health_conditions: string[] | null;
  conditions: string[] | null;
  common_symptoms: string[] | null;
  current_symptoms: string[] | null;
  health_goals: string[] | null;
  food_sensitivities: string[] | null;
  dietary_preferences: string[] | null;
  dietary_restrictions: string[] | null;
  notification_morning: boolean;
  notification_evening: boolean;
  notification_meals: boolean;
  notification_meds: boolean;
  morning_time: string | null;
  evening_time: string | null;
  streak_count: number;
  longest_streak: number;
  last_check_in: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  energy: number;
  gut: number;
  mood: number;
  symptoms: string[];
  notes: string | null;
  check_in_date: string;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  photo_url: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  gut_score: number | null;
  logged_at: string;
  created_at: string;
}

export interface Supplement {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  time_of_day: string | null;
  best_time: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  time_of_day: string | null;
  with_food: boolean;
  empty_stomach: boolean;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface MedLog {
  id: string;
  user_id: string;
  medication_id: string | null;
  supplement_id: string | null;
  taken_at: string;
  skipped: boolean;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}
