import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import TeamNotes from '@/components/TeamNotes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import ActionItemsSection from '@/components/dashboard/ActionItemsSection';
import SocialPostsSection from '@/components/dashboard/SocialPostsSection';
import AdminPasswordDialog from '@/components/dashboard/AdminPasswordDialog';
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
  task: string;
  status: string;
  due_date: string;
  assignee: string;
  priority: string;
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

  useEffect(() => {
    loadAllData();
    
    // Set up real-time subscriptions
    const actionItemsChannel = supabase
      .channel('action-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'action_items'
        },
        () => {
          console.log('Action items changed, reloading...');
          loadActionItems();
        }
      )
      .subscribe();

    const socialPostsChannel = supabase
      .channel('social-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts'
        },
        () => {
          console.log('Social posts changed, reloading...');
          loadSocialPosts();
        }
      )
      .subscribe();

    const meetingsChannel = supabase
      .channel('meetings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_minutes'
        },
        () => {
          console.log('Meeting minutes changed, reloading...');
          loadMeetingInfo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(actionItemsChannel);
      supabase.removeChannel(socialPostsChannel);
      supabase.removeChannel(meetingsChannel);
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
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActionItems(data || []);
      console.log('Loaded action items:', data?.length || 0);
    } catch (error) {
      console.error('Error loading action items:', error);
    }
  };

  const loadSocialPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      setUpcomingSocialPosts(data || []);
      console.log('Loaded all social posts:', data?.length || 0);
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find the most recent past meeting
        const lastMeeting = meetings.find(meeting => {
          const meetingDate = new Date(meeting.meeting_date);
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate <= today;
        });

        // Find the next future meeting (check both meeting_date and next_meeting_date)
        let nextMeeting = null;
        
        // First check if any meeting has a next_meeting_date in the future
        for (const meeting of meetings) {
          if (meeting.next_meeting_date) {
            const nextMeetingDate = new Date(meeting.next_meeting_date);
            nextMeetingDate.setHours(0, 0, 0, 0);
            if (nextMeetingDate > today) {
              nextMeeting = { date: meeting.next_meeting_date };
              break;
            }
          }
        }
        
        // If no next_meeting_date found, check for future meeting_date entries
        if (!nextMeeting) {
          const futureMeeting = meetings.find(meeting => {
            const meetingDate = new Date(meeting.meeting_date);
            meetingDate.setHours(0, 0, 0, 0);
            return meetingDate > today;
          });
          
          if (futureMeeting) {
            nextMeeting = { date: futureMeeting.meeting_date };
          }
        }

        setMeetingInfo({
          lastMeeting: lastMeeting ? {
            date: lastMeeting.meeting_date,
            attendees: lastMeeting.attendees?.length || 0
          } : null,
          nextMeeting
        });

        console.log('Loaded meeting info:', { 
          lastMeeting: lastMeeting ? {
            date: lastMeeting.meeting_date,
            attendees: lastMeeting.attendees?.length || 0
          } : null,
          nextMeeting 
        });
      } else {
        setMeetingInfo({ lastMeeting: null, nextMeeting: null });
      }
    } catch (error) {
      console.error('Error loading meeting info:', error);
      setMeetingInfo({ lastMeeting: null, nextMeeting: null });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAllData();
      toast({
        title: "Data Refreshed",
        description: "All data has been synchronized across devices.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Action item status updated to ${status.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive"
      });
    }
  };

  const handleSocialPostStatusChange = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Post Status Updated",
        description: `Social media post status updated to ${status.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error('Error updating social post status:', error);
      toast({
        title: "Error",
        description: "Failed to update post status.",
        variant: "destructive"
      });
    }
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

  const handleDeleteConfirm = async () => {
    if (adminPassword !== ADMIN_PASSWORD) {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (deleteItemType === 'action' && deleteItemId) {
        const { error } = await supabase
          .from('action_items')
          .delete()
          .eq('id', deleteItemId);

        if (error) throw error;

        toast({
          title: "Action Item Deleted",
          description: "The action item has been successfully deleted.",
        });
      } else if (deleteItemType === 'social' && deleteItemId) {
        const { error } = await supabase
          .from('social_posts')
          .delete()
          .eq('id', parseInt(deleteItemId));

        if (error) throw error;

        toast({
          title: "Social Post Deleted",
          description: "The social media post has been successfully deleted.",
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive"
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

  // Convert Supabase action items to dashboard format
  const dashboardActionItems = actionItems.map(item => ({
    id: item.id,
    title: item.task,
    description: item.task,
    status: item.status,
    dueDate: item.due_date || new Date().toISOString().split('T')[0],
    assignee: item.assignee
  }));

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
                <p className="font-medium text-blue-800">Next Scheduled Meeting</p>
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
        actionItems={dashboardActionItems}
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
