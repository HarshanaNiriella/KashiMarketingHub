
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface ExportData {
  staff: any[];
  socialPosts: any[];
  meetingMinutes: any[];
  actionItems: any[];
}

export const exportToJSON = (data: any, filename: string) => {
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
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
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
};

export const getAllData = async (): Promise<ExportData> => {
  try {
    const [staffResult, socialPostsResult, meetingMinutesResult, actionItemsResult] = await Promise.all([
      supabase.from('staff').select('*').order('created_at', { ascending: false }),
      supabase.from('social_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('meeting_minutes').select('*').order('created_at', { ascending: false }),
      supabase.from('action_items').select('*').order('created_at', { ascending: false })
    ]);

    return {
      staff: staffResult.data || [],
      socialPosts: socialPostsResult.data || [],
      meetingMinutes: meetingMinutesResult.data || [],
      actionItems: actionItemsResult.data || []
    };
  } catch (error) {
    console.error('Error fetching data for export:', error);
    throw error;
  }
};

export const exportAllData = async (format: 'json' | 'csv' = 'json') => {
  try {
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
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

export const exportTableData = async (tableName: TableName, format: 'json' | 'csv' = 'json') => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `kashi-${tableName}-${timestamp}`;

    if (format === 'json') {
      exportToJSON(data, filename);
    } else {
      exportToCSV(data || [], filename);
    }
  } catch (error) {
    console.error(`Export failed for ${tableName}:`, error);
    throw error;
  }
};
