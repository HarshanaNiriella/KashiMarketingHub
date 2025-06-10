
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import TeamNotes from '@/components/TeamNotes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import ActionItemsSection from '@/components/dashboard/ActionItemsSection';
import SocialPostsSection from '@/components/dashboard/SocialPostsSection';
import AdminPasswordDialog from '@/components/dashboard/AdminPasswordDialog';
import { useDataSync } from '@/utils/dataSync';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  onSchedulePost: () => void;
  onViewTimeline: () => void;
  onAddMeetingMinutes: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  assignee: string;
}

interface SocialPost {
  id: number;
  content: string;
  platform: string;
  type: string;
  status: string;
  date: string;
  time: string;
}

interface MeetingInfo {
  lastMeeting: {
    date: string;
    attendees: number;
  } | null;
  nextMeeting: {
    date: string;
  } | null;
}

const Dashboard = ({ onSchedulePost, onViewTimeline, onAddMeetingMinutes }: DashboardProps) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [upcomingSocialPosts, setUpcomingSocialPosts] = useState<SocialPost[]>([]);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>({ lastMeeting: null, nextMeeting: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<'action' | 'social' | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { toast } = useToast();

  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ id: string; type: 'action' | 'social_post'; title: string } | null>(null);

  const ADMIN_PASSWORD = 'admin';

  // Use data sync hook
  const { syncData, refreshData } = useDataSync();

  useEffect(() => {
    loadAllData();
  }, []);

  // Listen for data refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('Dashboard received data refresh event');
      loadAllData();
    };

    window.addEventListener('dataRefresh', handleDataRefresh);
    
    return () => {
      window.removeEventListener('dataRefresh', handleDataRefresh);
    };
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadActionItems(),
      loadSocialPosts(),
      loadMeetingInfo()
    ]);
  };

  const loadActionItems = async () => {
    try {
      // Load from both localStorage and Supabase
      const localStored = localStorage.getItem('actionItems');
      let localItems: ActionItem[] = [];
      
      if (localStored) {
        localItems = JSON.parse(localStored);
      } else {
        // Default action items if none exist
        const defaultActions: ActionItem[] = [
          {
            id: '1',
            title: 'Brainstorming Session',
            description: 'Discuss Q1 marketing strategies.',
            status: 'pending',
            dueDate: '2024-12-15',
            assignee: 'Marketing Team'
          },
          {
            id: '2',
            title: 'Content Calendar Review',
            description: 'Finalize content for January.',
            status: 'under_discussion',
            dueDate: '2024-12-20',
            assignee: 'Content Team'
          },
          {
            id: '3',
            title: 'Social Media Audit',
            description: 'Analyze performance metrics.',
            status: 'completed',
            dueDate: '2024-12-25',
            assignee: 'Analytics Team'
          }
        ];
        localItems = defaultActions;
        localStorage.setItem('actionItems', JSON.stringify(defaultActions));
      }

      // Also fetch from Supabase action_items table
      const { data: supabaseItems, error } = await supabase
        .from('action_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && supabaseItems) {
        // Convert Supabase format to local format
        const convertedItems: ActionItem[] = supabaseItems.map(item => ({
          id: item.id,
          title: item.task,
          description: item.task,
          status: item.status,
          dueDate: item.due_date || new Date().toISOString().split('T')[0],
          assignee: item.assignee
        }));

        // Merge with local items (avoiding duplicates)
        const allItems = [...localItems];
        convertedItems.forEach(supabaseItem => {
          if (!allItems.find(localItem => localItem.id === supabaseItem.id)) {
            allItems.push(supabaseItem);
          }
        });

        setActionItems(allItems);
        console.log('Loaded action items:', allItems.length);
      } else {
        setActionItems(localItems);
        console.log('Loaded local action items:', localItems.length);
      }
    } catch (error) {
      console.error('Error loading action items:', error);
    }
  };

  const loadSocialPosts = () => {
    try {
      const stored = localStorage.getItem('socialPosts');
      if (stored) {
        const posts = JSON.parse(stored);
        // Filter posts to only include those with a date in the future and status scheduled/planned
        const upcomingPosts = posts.filter((post: SocialPost) => {
          const postDate = new Date(post.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return postDate >= today && ['scheduled', 'planned'].includes(post.status);
        });
        
        setUpcomingSocialPosts(upcomingPosts);
        console.log('Loaded social posts:', upcomingPosts.length);
      } else {
        setUpcomingSocialPosts([]);
      }
    } catch (error) {
      console.error('Error loading social posts:', error);
      setUpcomingSocialPosts([]);
    }
  };

  const loadMeetingInfo = async () => {
    try {
      const { data: meetings, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (!error && meetings && meetings.length > 0) {
        // Find last meeting (most recent past or today)
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        const lastMeeting = meetings.find(meeting => 
          new Date(meeting.meeting_date) <= today
        );

        // Find next meeting (future)
        const nextMeeting = meetings.find(meeting => 
          new Date(meeting.meeting_date) > today
        );

        setMeetingInfo({
          lastMeeting: lastMeeting ? {
            date: lastMeeting.meeting_date,
            attendees: lastMeeting.attendees?.length || 0
          } : null,
          nextMeeting: nextMeeting ? {
            date: nextMeeting.next_meeting_date || nextMeeting.meeting_date
          } : null
        });

        console.log('Loaded meeting info:', { lastMeeting, nextMeeting });
      }
    } catch (error) {
      console.error('Error loading meeting info:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Use the data sync refresh function
      refreshData();
      
      // Add a small delay before reloading to ensure sync completes
      setTimeout(async () => {
        await loadAllData();
        setIsRefreshing(false);
        toast({
          title: "Data Refreshed",
          description: "All data has been synchronized across devices.",
        });
      }, 1000);
    } catch (error) {
      setIsRefreshing(false);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveActionItems = (items: ActionItem[]) => {
    try {
      localStorage.setItem('actionItems', JSON.stringify(items));
      setActionItems(items);
      // Trigger data sync after saving
      syncData();
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'actionItems',
        newValue: JSON.stringify(items),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error saving action items:', error);
    }
  };

  const saveSocialPosts = (posts: SocialPost[]) => {
    try {
      localStorage.setItem('socialPosts', JSON.stringify(posts));
      loadSocialPosts(); // Reload to update the upcoming posts
      // Trigger data sync after saving
      syncData();
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'socialPosts',
        newValue: JSON.stringify(posts),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error saving social posts:', error);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    const updatedItems = actionItems.map(item =>
      item.id === id ? { ...item, status } : item
    );
    saveActionItems(updatedItems);

    toast({
      title: "Status Updated",
      description: `Action item status updated to ${status.replace('_', ' ')}.`,
    });
  };

  const handleSocialPostStatusChange = (id: number, status: string) => {
    const updatedPosts = upcomingSocialPosts.map(post =>
      post.id === id ? { ...post, status } : post
    );
    saveSocialPosts(updatedPosts);

    toast({
      title: "Post Status Updated",
      description: `Social media post status updated to ${status.replace('_', ' ')}.`,
    });
  };

  const handleShowNotes = (item: { id: string; type: 'action' | 'social_post'; title: string }) => {
    setCurrentItem(item);
    setShowNotesDialog(true);
  };

  const handleDeleteClick = (id: string, type: 'action' | 'social') => {
    setDeleteItemId(id);
    setDeleteItemType(type);
    setShowPasswordDialog(true);
    setAdminPassword('');
  };

  const handleDeleteConfirm = () => {
    if (adminPassword !== ADMIN_PASSWORD) {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    if (deleteItemType === 'action' && deleteItemId) {
      const updatedItems = actionItems.filter(item => item.id !== deleteItemId);
      saveActionItems(updatedItems);
      toast({
        title: "Action Item Deleted",
        description: "The action item has been successfully deleted.",
      });
    } else if (deleteItemType === 'social' && deleteItemId) {
      const allPosts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
      const updatedPosts = allPosts.filter((post: SocialPost) => post.id.toString() !== deleteItemId);
      saveSocialPosts(updatedPosts);
      toast({
        title: "Social Post Deleted",
        description: "The social media post has been successfully deleted.",
      });
    }

    setShowPasswordDialog(false);
    setDeleteItemId(null);
    setDeleteItemType(null);
    setAdminPassword('');
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setAdminPassword('');
    setDeleteItemId(null);
    setDeleteItemType(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* Meeting Info Section */}
      <Card className="p-4 sm:p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📅 Meeting Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetingInfo.lastMeeting && (
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Last Marketing Meeting</p>
                <p className="text-sm text-emerald-600">
                  {format(new Date(meetingInfo.lastMeeting.date), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-emerald-500">
                  <Users className="h-3 w-3 inline mr-1" />
                  {meetingInfo.lastMeeting.attendees} attendees
                </p>
              </div>
            </div>
          )}
          
          {meetingInfo.nextMeeting && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Next Meeting</p>
                <p className="text-sm text-blue-600">
                  {format(new Date(meetingInfo.nextMeeting.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
          
          {!meetingInfo.lastMeeting && !meetingInfo.nextMeeting && (
            <div className="col-span-full text-center py-4">
              <p className="text-sage-600">No meeting information available</p>
              <p className="text-sm text-sage-500">Schedule your first meeting to get started</p>
            </div>
          )}
        </div>
      </Card>

      <QuickActions 
        onSchedulePost={onSchedulePost}
        onAddMeetingMinutes={onAddMeetingMinutes}
        onViewTimeline={onViewTimeline}
      />

      <ActionItemsSection 
        actionItems={actionItems}
        onStatusChange={handleStatusChange}
        onShowNotes={handleShowNotes}
        onDeleteClick={handleDeleteClick}
      />

      <SocialPostsSection 
        upcomingSocialPosts={upcomingSocialPosts}
        onSocialPostStatusChange={handleSocialPostStatusChange}
        onShowNotes={handleShowNotes}
        onDeleteClick={handleDeleteClick}
      />

      <AdminPasswordDialog 
        isOpen={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        onConfirm={handleDeleteConfirm}
        password={adminPassword}
        onPasswordChange={setAdminPassword}
      />

      <TeamNotes
        itemId={currentItem?.id || ''}
        itemType={currentItem?.type || 'action'}
        itemTitle={currentItem?.title || ''}
        isOpen={showNotesDialog}
        onClose={() => setShowNotesDialog(false)}
      />
    </div>
  );
};

export default Dashboard;
