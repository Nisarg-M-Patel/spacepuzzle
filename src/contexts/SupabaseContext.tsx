
import { createContext, useContext } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};