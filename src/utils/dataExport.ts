
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface ExportData {
  staff: any[];
  socialPosts: any[];
  meetingMinutes: any[];
  actionItems: any[];
  userRoles: any[];
  profiles: any[];
}

export const exportToJSON = (data: any, filename: string) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to export data as JSON');
  }
};

export const exportToCSV = (data: any[], filename: string) => {
  try {
    if (data.length === 0) {
      console.warn('No data to export for', filename);
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle arrays and objects
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value)}"`;
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data as CSV');
  }
};

export const getAllData = async (): Promise<ExportData> => {
  try {
    console.log('Starting data export from Supabase...');
    
    const [staffResult, socialPostsResult, meetingMinutesResult, actionItemsResult, userRolesResult, profilesResult] = await Promise.allSettled([
      supabase.from('staff').select('*').order('created_at', { ascending: false }),
      supabase.from('social_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('meeting_minutes').select('*').order('created_at', { ascending: false }),
      supabase.from('action_items').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*').order('assigned_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ]);

    // Handle results and log any errors
    const handleResult = (result: PromiseSettledResult<any>, tableName: string) => {
      if (result.status === 'fulfilled') {
        if (result.value.error) {
          console.error(`Error fetching ${tableName}:`, result.value.error);
          return [];
        }
        console.log(`Successfully fetched ${tableName}:`, result.value.data?.length || 0, 'records');
        return result.value.data || [];
      } else {
        console.error(`Failed to fetch ${tableName}:`, result.reason);
        return [];
      }
    };

    return {
      staff: handleResult(staffResult, 'staff'),
      socialPosts: handleResult(socialPostsResult, 'social_posts'),
      meetingMinutes: handleResult(meetingMinutesResult, 'meeting_minutes'),
      actionItems: handleResult(actionItemsResult, 'action_items'),
      userRoles: handleResult(userRolesResult, 'user_roles'),
      profiles: handleResult(profilesResult, 'profiles')
    };
  } catch (error) {
    console.error('Error fetching data for export:', error);
    throw error;
  }
};

export const exportAllData = async (format: 'json' | 'csv' = 'json') => {
  try {
    console.log('Exporting all data in', format, 'format...');
    const data = await getAllData();
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'json') {
      exportToJSON(data, `kashi-wellness-data-${timestamp}`);
    } else {
      // Export each table as separate CSV files
      exportToCSV(data.staff, `kashi-staff-${timestamp}`);
      exportToCSV(data.socialPosts, `kashi-social-posts-${timestamp}`);
      exportToCSV(data.meetingMinutes, `kashi-meeting-minutes-${timestamp}`);
      exportToCSV(data.actionItems, `kashi-action-items-${timestamp}`);
      exportToCSV(data.userRoles, `kashi-user-roles-${timestamp}`);
      exportToCSV(data.profiles, `kashi-profiles-${timestamp}`);
    }
    console.log('Export completed successfully');
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

export const exportTableData = async (tableName: TableName, format: 'json' | 'csv' = 'json') => {
  try {
    console.log(`Exporting table ${tableName} in ${format} format...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }

    console.log(`Successfully fetched ${tableName}:`, data?.length || 0, 'records');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `kashi-${tableName}-${timestamp}`;

    if (format === 'json') {
      exportToJSON(data, filename);
    } else {
      exportToCSV(data || [], filename);
    }
    
    console.log(`Export of ${tableName} completed successfully`);
  } catch (error) {
    console.error(`Export failed for ${tableName}:`, error);
    throw error;
  }
};
