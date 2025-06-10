
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SyncableData {
  actionItems: any[];
  socialPosts: any[];
  staff: any[];
  lastUpdated: string;
}

export const useDataSync = () => {
  useEffect(() => {
    console.log('Data sync initialized with Supabase real-time');
    
    // The real-time synchronization is now handled by individual components
    // This hook is kept for backward compatibility but the heavy lifting
    // is done by Supabase's real-time subscriptions in each component
    
    return () => {
      console.log('Data sync cleanup');
    };
  }, []);

  const syncData = async () => {
    try {
      console.log('Manual sync requested - Supabase handles this automatically');
      return {
        actionItems: [],
        socialPosts: [],
        staff: [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in manual sync:', error);
      return null;
    }
  };

  const checkForUpdates = () => {
    // With Supabase real-time, updates are pushed automatically
    console.log('Supabase real-time handles update checking automatically');
    return false;
  };

  const refreshData = () => {
    try {
      console.log('Data refresh requested - triggering custom event');
      
      // Dispatch a custom event that components can listen to for manual refresh
      window.dispatchEvent(new CustomEvent('dataRefresh', { 
        detail: { timestamp: new Date().toISOString() } 
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const forceSync = () => {
    try {
      console.log('Force sync requested');
      refreshData();
    } catch (error) {
      console.error('Error force syncing:', error);
    }
  };

  return { syncData, checkForUpdates, refreshData, forceSync };
};

export default useDataSync;
