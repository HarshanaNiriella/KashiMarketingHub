import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, CheckCircle, Clock, AlertCircle, Users, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  priority: string;
  status: string;
}

interface MeetingMinute {
  id: string;
  meeting_date: string;
  next_meeting_date?: string;
  attendees: string[];
}

interface DashboardProps {
  onSchedulePost: () => void;
  onViewTimeline: () => void;
  onAddMeetingMinutes: () => void;
}

const Dashboard = ({ onSchedulePost, onViewTimeline, onAddMeetingMinutes }: DashboardProps) => {
  const [lastMeeting, setLastMeeting] = useState<MeetingMinute | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch the most recent meeting
      const { data: meetings, error: meetingError } = await supabase
        .from('meeting_minutes')
        .select('*')
        .order('meeting_date', { ascending: false })
        .limit(1);

      if (meetingError) throw meetingError;

      if (meetings && meetings.length > 0) {
        setLastMeeting(meetings[0]);

        // Fetch action items from the last meeting
        const { data: items, error: itemsError } = await supabase
          .from('action_items')
          .select('*')
          .eq('meeting_minutes_id', meetings[0].id);

        if (itemsError) throw itemsError;
        setActionItems(items || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = (type: string, id: string) => {
    setItemToDelete({ type, id });
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
      if (itemToDelete.type === 'meeting') {
        const { error } = await supabase
          .from('meeting_minutes')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;
        setLastMeeting(null);
        setActionItems([]);
      } else if (itemToDelete.type === 'action_item') {
        const { error } = await supabase
          .from('action_items')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;
        setActionItems(prev => prev.filter(item => item.id !== itemToDelete.id));
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      delayed: "bg-orange-100 text-orange-700 border-orange-200",
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      draft: "bg-purple-100 text-purple-700 border-purple-200",
      planned: "bg-sage-100 text-sage-700 border-sage-200"
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} capitalize`}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sage-600">Loading dashboard...</div>
      </div>
    );
  }

  const completedItems = actionItems.filter(item => item.status === 'completed').length;
  const pendingItems = actionItems.filter(item => item.status === 'pending').length;
  const delayedItems = actionItems.filter(item => item.status === 'delayed').length;

  return (
    <div className="space-y-6">
      {/* Meeting Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-sage-200 bg-gradient-to-br from-white to-emerald-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-sage-800">Last Marketing Meeting</h3>
            </div>
            {lastMeeting && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteRequest('meeting', lastMeeting.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {lastMeeting ? (
            <>
              <p className="text-2xl font-bold text-emerald-600 mb-2">
                {format(new Date(lastMeeting.meeting_date), 'MMMM d, yyyy')}
              </p>
              <div className="flex items-center space-x-2 text-sm text-sage-600 mb-2">
                <Users className="h-4 w-4" />
                <span>{lastMeeting.attendees.length} attendees</span>
              </div>
              <p className="text-sm text-sage-600">
                {actionItems.length} action items • {completedItems} completed, {pendingItems} pending, {delayedItems} delayed
              </p>
            </>
          ) : (
            <p className="text-sage-600">No meetings recorded yet</p>
          )}
        </Card>

        <Card className="p-6 border-sage-200 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-sage-800">Next Marketing Meeting</h3>
          </div>
          {lastMeeting?.next_meeting_date ? (
            <>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {format(new Date(lastMeeting.next_meeting_date), 'MMMM d, yyyy')}
              </p>
              <p className="text-sm text-sage-600">Scheduled • Review pending items</p>
            </>
          ) : (
            <p className="text-sage-600">Next meeting not scheduled</p>
          )}
        </Card>
      </div>

      {/* Action Items Status */}
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📋 Current Action Items</h3>
        {actionItems.length > 0 ? (
          <div className="space-y-3">
            {actionItems.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg border border-sage-100">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <p className="font-medium text-sage-800">{task.task}</p>
                    <p className="text-sm text-sage-600">Assigned to: {task.assignee}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`capitalize px-2 py-1 text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {task.priority}
                  </Badge>
                  {getStatusBadge(task.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRequest('action_item', task.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sage-600">No action items from recent meetings</p>
        )}
      </Card>

      {/* Social Media Preview */}
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📱 Upcoming Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-lg border border-purple-100">
            <div className="flex justify-between items-start mb-2">
              {getStatusBadge('scheduled')}
              <span className="text-sm text-sage-600">Dec 8</span>
            </div>
            <p className="font-medium text-sage-800 mb-1">Morning meditation tips</p>
            <p className="text-sm text-sage-600">Instagram</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-lg border border-purple-100">
            <div className="flex justify-between items-start mb-2">
              {getStatusBadge('draft')}
              <span className="text-sm text-sage-600">Dec 10</span>
            </div>
            <p className="font-medium text-sage-800 mb-1">Wellness Wednesday quote</p>
            <p className="text-sm text-sage-600">Facebook</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-lg border border-purple-100">
            <div className="flex justify-between items-start mb-2">
              {getStatusBadge('planned')}
              <span className="text-sm text-sage-600">Dec 12</span>
            </div>
            <p className="font-medium text-sage-800 mb-1">New retreat photos</p>
            <p className="text-sm text-sage-600">Instagram</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={onAddMeetingMinutes}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          ✍️ Add Meeting Minutes
        </Button>
        <Button 
          variant="outline" 
          onClick={onSchedulePost}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          📱 Schedule Social Post
        </Button>
        <Button 
          variant="outline" 
          onClick={onViewTimeline}
          className="border-sage-200 text-sage-700 hover:bg-sage-50"
        >
          📊 View Timeline
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
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

export default Dashboard;
