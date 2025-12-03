import { useState, useEffect, useCallback } from 'react';
import { supabase, CheckIn, Meal, Supplement, Medication, MedLog } from './supabase';
import { useAuth } from './auth';

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get start and end of day
export const getDayBounds = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ============ CHECK-INS ============

export function useCheckIns(dateRange?: { start: Date; end: Date }) {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCheckIns = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('check_in_date', formatDate(dateRange.start))
          .lte('check_in_date', formatDate(dateRange.end));
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setCheckIns(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, dateRange?.start?.toISOString(), dateRange?.end?.toISOString()]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  return { checkIns, isLoading, error, refetch: fetchCheckIns };
}

export function useTodayCheckIn() {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodayCheckIn = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const today = formatDate(new Date());
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('check_in_date', today)
        .single();

      if (!error) {
        setCheckIn(data);
      } else {
        setCheckIn(null);
      }
    } catch {
      setCheckIn(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodayCheckIn();
  }, [fetchTodayCheckIn]);

  const saveCheckIn = async (data: Omit<CheckIn, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      console.error('❌ saveCheckIn: No user authenticated');
      return { error: new Error('Not authenticated') };
    }

    console.log('📝 saveCheckIn called:', { userId: user.id, hasExisting: !!checkIn, data });

    try {
      if (checkIn) {
        // Update existing
        console.log('🔄 Updating existing check-in:', checkIn.id);
        const { data: result, error } = await supabase
          .from('check_ins')
          .update({
            energy: data.energy,
            gut: data.gut,
            mood: data.mood,
            symptoms: data.symptoms || [],
            notes: data.notes,
            check_in_date: data.check_in_date,
          })
          .eq('id', checkIn.id)
          .select();
        
        if (error) {
          console.error('❌ Update error:', error);
        } else {
          console.log('✅ Update success:', result);
          await fetchTodayCheckIn();
        }
        return { error };
      } else {
        // Create new
        console.log('➕ Creating new check-in');
        const insertData = {
          user_id: user.id,
          energy: data.energy,
          gut: data.gut,
          mood: data.mood,
          symptoms: data.symptoms || [],
          notes: data.notes,
          check_in_date: data.check_in_date,
        };
        console.log('📤 Insert data:', insertData);
        
        const { data: result, error } = await supabase
          .from('check_ins')
          .insert(insertData)
          .select();
        
        if (error) {
          console.error('❌ Insert error:', error.message, error.details, error.hint);
        } else {
          console.log('✅ Insert success:', result);
          await fetchTodayCheckIn();
        }
        return { error };
      }
    } catch (err) {
      console.error('❌ saveCheckIn exception:', err);
      return { error: err as Error };
    }
  };

  return { checkIn, isLoading, refetch: fetchTodayCheckIn, saveCheckIn };
}

// ============ MEALS ============

export function useMeals(filter: 'today' | 'week' | 'month' | 'all' = 'today') {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMeals = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      switch (filter) {
        case 'today':
          // Get today's start and end in local timezone
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      let query = supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      if (startDate) {
        query = query.gte('logged_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('logged_at', endDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMeals(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const addMeal = async (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({ ...meal, user_id: user.id })
        .select()
        .single();

      if (!error) await fetchMeals();
      return { error, data };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);

      if (!error) await fetchMeals();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { meals, isLoading, error, refetch: fetchMeals, addMeal, deleteMeal };
}

// ============ SUPPLEMENTS ============

export function useSupplements() {
  const { user } = useAuth();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSupplements = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('time_of_day', { ascending: true });

      if (error) throw error;
      setSupplements(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  const addSupplement = async (supplement: Omit<Supplement, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('supplements')
        .insert({ ...supplement, user_id: user.id });

      if (!error) await fetchSupplements();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateSupplement = async (id: string, updates: Partial<Supplement>) => {
    try {
      const { error } = await supabase
        .from('supplements')
        .update(updates)
        .eq('id', id);

      if (!error) await fetchSupplements();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteSupplement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('supplements')
        .update({ active: false })
        .eq('id', id);

      if (!error) await fetchSupplements();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { supplements, isLoading, error, refetch: fetchSupplements, addSupplement, updateSupplement, deleteSupplement };
}

// ============ MEDICATIONS ============

export function useMedications() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('time_of_day', { ascending: true });

      if (error) throw error;
      setMedications(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const addMedication = async (medication: Omit<Medication, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('medications')
        .insert({ ...medication, user_id: user.id });

      if (!error) await fetchMedications();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id);

      if (!error) await fetchMedications();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ active: false })
        .eq('id', id);

      if (!error) await fetchMedications();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { medications, isLoading, error, refetch: fetchMedications, addMedication, updateMedication, deleteMedication };
}

// ============ MED LOGS (Taken tracking) ============

export function useTodayMedLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MedLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { start, end } = getDayBounds(new Date());
      
      const { data, error } = await supabase
        .from('med_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('taken_at', start.toISOString())
        .lte('taken_at', end.toISOString());

      if (!error) {
        setLogs(data || []);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logMed = async (medicationId: string | null, supplementId: string | null, skipped = false) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('med_logs')
        .insert({
          user_id: user.id,
          medication_id: medicationId,
          supplement_id: supplementId,
          taken_at: new Date().toISOString(),
          skipped,
        });

      if (!error) await fetchLogs();
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const isLogged = (medicationId: string | null, supplementId: string | null) => {
    return logs.some(log => 
      (medicationId && log.medication_id === medicationId) ||
      (supplementId && log.supplement_id === supplementId)
    );
  };

  return { logs, isLoading, refetch: fetchLogs, logMed, isLogged };
}

// ============ INSIGHTS ============

export function useInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<{
    avgGut: number;
    avgMood: number;
    avgEnergy: number;
    topSymptoms: { symptom: string; count: number }[];
    gutTrend: 'up' | 'down' | 'stable';
    mealCorrelations: { food: string; impact: 'positive' | 'negative' }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateInsights = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get last 14 days of check-ins
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .gte('check_in_date', formatDate(twoWeeksAgo))
        .order('check_in_date', { ascending: true });

      if (!checkIns || checkIns.length === 0) {
        setInsights(null);
        return;
      }

      // Calculate averages
      const avgGut = checkIns.reduce((sum, c) => sum + c.gut, 0) / checkIns.length;
      const avgMood = checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length;
      const avgEnergy = checkIns.reduce((sum, c) => sum + c.energy, 0) / checkIns.length;

      // Count symptoms
      const symptomCounts: Record<string, number> = {};
      checkIns.forEach(c => {
        (c.symptoms || []).forEach((s: string) => {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        });
      });

      const topSymptoms = Object.entries(symptomCounts)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate trend (compare last 7 days to previous 7 days)
      const midpoint = Math.floor(checkIns.length / 2);
      const firstHalf = checkIns.slice(0, midpoint);
      const secondHalf = checkIns.slice(midpoint);

      const firstAvg = firstHalf.reduce((sum, c) => sum + c.gut, 0) / (firstHalf.length || 1);
      const secondAvg = secondHalf.reduce((sum, c) => sum + c.gut, 0) / (secondHalf.length || 1);

      let gutTrend: 'up' | 'down' | 'stable' = 'stable';
      if (secondAvg - firstAvg > 0.5) gutTrend = 'up';
      if (firstAvg - secondAvg > 0.5) gutTrend = 'down';

      setInsights({
        avgGut,
        avgMood,
        avgEnergy,
        topSymptoms,
        gutTrend,
        mealCorrelations: [], // Would need more complex analysis
      });
    } catch (err) {
      console.error('Error calculating insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    calculateInsights();
  }, [calculateInsights]);

  return { insights, isLoading, refetch: calculateInsights };
}
