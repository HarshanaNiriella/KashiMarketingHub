
import { useEffect, useCallback } from 'react';

export interface SyncableData {
  actionItems: any[];
  socialPosts: any[];
  staff: any[];
  lastUpdated: string;
}

export const useDataSync = () => {
  const syncData = useCallback(() => {
    try {
      // Get all data from localStorage
      const actionItems = JSON.parse(localStorage.getItem('actionItems') || '[]');
      const socialPosts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
      const staff = JSON.parse(localStorage.getItem('staff') || '[]');
      
      const syncData: SyncableData = {
        actionItems,
        socialPosts,
        staff,
        lastUpdated: new Date().toISOString()
      };

      // Store in a separate sync key for cross-device comparison
      localStorage.setItem('syncData', JSON.stringify(syncData));
      
      // Also store a timestamp for last sync
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      
      console.log('Data synced at:', new Date().toISOString());
      
      return syncData;
    } catch (error) {
      console.error('Error syncing data:', error);
      return null;
    }
  }, []);

  const checkForUpdates = useCallback(() => {
    try {
      const storedSyncData = localStorage.getItem('syncData');
      if (!storedSyncData) return false;

      const syncData = JSON.parse(storedSyncData);
      const currentActionItems = JSON.parse(localStorage.getItem('actionItems') || '[]');
      const currentSocialPosts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
      const currentStaff = JSON.parse(localStorage.getItem('staff') || '[]');

      // Check if data has changed
      const hasChanged = 
        JSON.stringify(syncData.actionItems) !== JSON.stringify(currentActionItems) ||
        JSON.stringify(syncData.socialPosts) !== JSON.stringify(currentSocialPosts) ||
        JSON.stringify(syncData.staff) !== JSON.stringify(currentStaff);

      if (hasChanged) {
        console.log('Data changes detected, syncing...');
      }

      return hasChanged;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }, []);

  const refreshData = useCallback(() => {
    try {
      console.log('Refreshing data across all components...');
      syncData();
      
      // Dispatch a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('dataRefresh', { 
        detail: { timestamp: new Date().toISOString() } 
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [syncData]);

  const forceSync = useCallback(() => {
    try {
      console.log('Force syncing all data...');
      syncData();
      refreshData();
    } catch (error) {
      console.error('Error force syncing:', error);
    }
  }, [syncData, refreshData]);

  useEffect(() => {
    // Sync data on component mount
    syncData();

    // Set up periodic sync every 30 seconds (reduced frequency)
    const interval = setInterval(() => {
      if (checkForUpdates()) {
        syncData();
      }
    }, 30000);

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && ['actionItems', 'socialPosts', 'staff'].includes(event.key)) {
        console.log(`Storage change detected for ${event.key}`);
        
        // Add a small delay to prevent conflicts
        setTimeout(() => {
          syncData();
          // Trigger a refresh event
          window.dispatchEvent(new CustomEvent('dataRefresh', { 
            detail: { key: event.key, timestamp: new Date().toISOString() } 
          }));
        }, 500);
      }
    };

    // Listen for custom refresh events
    const handleDataRefresh = (event: CustomEvent) => {
      console.log('Data refresh event received:', event.detail);
      // Add a small delay to prevent multiple rapid syncs
      setTimeout(() => {
        syncData();
      }, 100);
    };

    // Listen for visibility change (when user switches tabs/apps)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, checking for updates...');
        setTimeout(() => {
          forceSync();
        }, 1000);
      }
    };

    // Listen for focus events (when user comes back to the window)
    const handleFocus = () => {
      console.log('Window focused, syncing data...');
      setTimeout(() => {
        forceSync();
      }, 500);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dataRefresh', handleDataRefresh as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataRefresh', handleDataRefresh as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncData, checkForUpdates, forceSync]);

  return { syncData, checkForUpdates, refreshData, forceSync };
};

export default useDataSync;
