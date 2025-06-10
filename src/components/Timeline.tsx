
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

interface SocialPost {
  id: number;
  content: string;
  platform: string;
  type: string;
  status: string;
  date: string;
  time: string;
  media: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  assignee: string;
}

// Get social posts from localStorage
const getSocialPosts = (): SocialPost[] => {
  try {
    const stored = localStorage.getItem('socialPosts');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading social posts:', error);
    return [];
  }
};

// Get action items from localStorage
const getActionItems = (): ActionItem[] => {
  try {
    const stored = localStorage.getItem('actionItems');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading action items:', error);
    return [];
  }
};

const Timeline = () => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimelineData();
  }, []);

  // Listen for data refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('Timeline received data refresh event');
      fetchTimelineData();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && ['socialPosts', 'actionItems'].includes(event.key)) {
        console.log(`Timeline: Storage change detected for ${event.key}`);
        fetchTimelineData();
      }
    };

    window.addEventListener('dataRefresh', handleDataRefresh);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('dataRefresh', handleDataRefresh);
      window.removeEventListener('storage', handleStorageChange);
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

      // Get social media posts from localStorage
      const socialPosts = getSocialPosts();
      const socialPostItems: TimelineItem[] = socialPosts.map(post => ({
        id: `social-${post.id}`,
        type: 'social_post',
        title: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
        date: post.date,
        details: `${post.platform} ${post.type} - ${post.status}`,
        status: post.status
      }));

      // Get action items from localStorage
      const actionItems = getActionItems();
      const actionItemItems: TimelineItem[] = actionItems.map(item => ({
        id: `action-${item.id}`,
        type: 'action_item',
        title: item.title,
        date: item.dueDate,
        details: `Assigned to: ${item.assignee} - ${item.description}`,
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
        // Handle social post deletion from localStorage
        const socialPosts = getSocialPosts();
        const postId = parseInt(itemToDelete.replace('social-', ''));
        const updatedPosts = socialPosts.filter(post => post.id !== postId);
        localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'socialPosts',
          newValue: JSON.stringify(updatedPosts),
          storageArea: localStorage
        }));
      } else if (item?.type === 'action_item') {
        // Handle action item deletion from localStorage
        const actionItems = getActionItems();
        const actionId = itemToDelete.replace('action-', '');
        const updatedItems = actionItems.filter(item => item.id !== actionId);
        localStorage.setItem('actionItems', JSON.stringify(updatedItems));
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'actionItems',
          newValue: JSON.stringify(updatedItems),
          storageArea: localStorage
        }));
      }

      // Remove from local state
      setTimelineItems(prev => prev.filter(item => item.id !== itemToDelete));
      
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
