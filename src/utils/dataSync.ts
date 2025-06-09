
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

      return hasChanged;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }, []);

  const refreshData = useCallback(() => {
    try {
      // Trigger a page refresh or data reload
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  useEffect(() => {
    // Sync data on component mount
    syncData();

    // Set up periodic sync every 30 seconds
    const interval = setInterval(() => {
      if (checkForUpdates()) {
        syncData();
      }
    }, 30000);

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && ['actionItems', 'socialPosts', 'staff'].includes(event.key)) {
        syncData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncData, checkForUpdates]);

  return { syncData, checkForUpdates, refreshData };
};

export default useDataSync;
