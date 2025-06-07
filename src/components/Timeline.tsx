
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimelineItem {
  id: string;
  type: 'meeting' | 'social_post';
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
  }, []);

  const fetchTimelineData = async () => {
    try {
      // Fetch meeting minutes
      const { data: meetings, error: meetingError } = await supabase
        .from('meeting_minutes')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (meetingError) throw meetingError;

      const meetingItems: TimelineItem[] = (meetings || []).map(meeting => ({
        id: meeting.id,
        type: 'meeting',
        title: `Marketing Meeting`,
        date: meeting.meeting_date,
        details: `Duration: ${meeting.duration} | Attendees: ${meeting.attendees?.length || 0}`,
        status: 'completed'
      }));

      // Mock social media posts for timeline
      const socialPosts: TimelineItem[] = [
        {
          id: 'social-1',
          type: 'social_post',
          title: 'Morning meditation tips',
          date: '2024-12-08',
          details: 'Instagram post - Scheduled',
          status: 'scheduled'
        },
        {
          id: 'social-2',
          type: 'social_post',
          title: 'Wellness Wednesday quote',
          date: '2024-12-10',
          details: 'Facebook post - Draft',
          status: 'draft'
        }
      ];

      const allItems = [...meetingItems, ...socialPosts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTimelineItems(allItems);
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
      planned: "bg-sage-100 text-sage-700"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    return type === 'meeting' ? <Users className="h-4 w-4" /> : <Calendar className="h-4 w-4" />;
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
          {timelineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-100">
              <div className="flex items-center space-x-3">
                {getTypeIcon(item.type)}
                <div>
                  <p className="font-medium text-sage-800">{item.title}</p>
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
          ))}
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
