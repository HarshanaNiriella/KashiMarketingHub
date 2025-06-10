
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimelineItem {
  id: string;
  type: 'meeting' | 'social_post' | 'action_item';
  title: string;
  date: string;
  details: string;
  status?: string;
}

const Timeline = () => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimelineData();
    
    // Set up real-time subscriptions
    const meetingsChannel = supabase
      .channel('timeline-meetings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_minutes'
        },
        () => {
          console.log('Meeting minutes changed, reloading timeline...');
          fetchTimelineData();
        }
      )
      .subscribe();

    const socialPostsChannel = supabase
      .channel('timeline-social-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts'
        },
        () => {
          console.log('Social posts changed, reloading timeline...');
          fetchTimelineData();
        }
      )
      .subscribe();

    const actionItemsChannel = supabase
      .channel('timeline-action-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'action_items'
        },
        () => {
          console.log('Action items changed, reloading timeline...');
          fetchTimelineData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(meetingsChannel);
      supabase.removeChannel(socialPostsChannel);
      supabase.removeChannel(actionItemsChannel);
    };
  }, []);

  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);

      // Fetch meeting minutes from Supabase
      const { data: meetings, error: meetingError } = await supabase
        .from('meeting_minutes')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (meetingError) {
        console.error('Error fetching meetings:', meetingError);
      }

      const meetingItems: TimelineItem[] = (meetings || []).map(meeting => ({
        id: meeting.id,
        type: 'meeting',
        title: `Marketing Meeting`,
        date: meeting.meeting_date,
        details: `Duration: ${meeting.duration || 'N/A'} | Attendees: ${meeting.attendees?.length || 0}`,
        status: 'completed'
      }));

      // Fetch social media posts from Supabase
      const { data: socialPosts, error: socialError } = await supabase
        .from('social_posts')
        .select('*')
        .order('date', { ascending: false });

      if (socialError) {
        console.error('Error fetching social posts:', socialError);
      }

      const socialPostItems: TimelineItem[] = (socialPosts || []).map(post => ({
        id: `social-${post.id}`,
        type: 'social_post',
        title: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
        date: post.date,
        details: `${post.platform} ${post.type} - ${post.status}`,
        status: post.status
      }));

      // Fetch action items from Supabase
      const { data: actionItems, error: actionError } = await supabase
        .from('action_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (actionError) {
        console.error('Error fetching action items:', actionError);
      }

      const actionItemItems: TimelineItem[] = (actionItems || []).map(item => ({
        id: `action-${item.id}`,
        type: 'action_item',
        title: item.task,
        date: item.due_date || item.created_at,
        details: `Assigned to: ${item.assignee} - ${item.task}`,
        status: item.status
      }));

      // Combine and sort all items by date
      const allItems = [...meetingItems, ...socialPostItems, ...actionItemItems].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTimelineItems(allItems);
      console.log('Timeline loaded:', allItems.length, 'items');
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = (itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteDialog(true);
    setDeletePassword('');
  };

  const handleDelete = async () => {
    if (deletePassword !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Incorrect password.",
        variant: "destructive"
      });
      return;
    }

    if (!itemToDelete) return;

    try {
      const item = timelineItems.find(i => i.id === itemToDelete);
      
      if (item?.type === 'meeting') {
        const { error } = await supabase
          .from('meeting_minutes')
          .delete()
          .eq('id', itemToDelete);

        if (error) throw error;
      } else if (item?.type === 'social_post') {
        const postId = parseInt(itemToDelete.replace('social-', ''));
        const { error } = await supabase
          .from('social_posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
      } else if (item?.type === 'action_item') {
        const actionId = itemToDelete.replace('action-', '');
        const { error } = await supabase
          .from('action_items')
          .delete()
          .eq('id', actionId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Item deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setDeletePassword('');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-emerald-100 text-emerald-700",
      scheduled: "bg-blue-100 text-blue-700",
      draft: "bg-purple-100 text-purple-700",
      planned: "bg-sage-100 text-sage-700",
      pending: "bg-orange-100 text-orange-700",
      under_discussion: "bg-yellow-100 text-yellow-700",
      delayed: "bg-red-100 text-red-700"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700"}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'social_post':
        return <Calendar className="h-4 w-4" />;
      case 'action_item':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'Meeting';
      case 'social_post':
        return 'Social Post';
      case 'action_item':
        return 'Action Item';
      default:
        return 'Item';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sage-600">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sage-800">📊 Timeline</h2>
      
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">Recent Activities</h3>
        
        <div className="space-y-4">
          {timelineItems.length > 0 ? (
            timelineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-100">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(item.type)}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sage-800">{item.title}</p>
                      <span className="text-xs bg-sage-200 text-sage-700 px-2 py-1 rounded">
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <p className="text-sm text-sage-600">{item.details}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-sage-500" />
                      <span className="text-xs text-sage-500">
                        {format(new Date(item.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status && getStatusBadge(item.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRequest(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sage-600 text-center py-8">No activities recorded yet</p>
          )}
        </div>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sage-600">Enter password to delete this item:</p>
            <Input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="border-sage-200"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="border-sage-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timeline;
