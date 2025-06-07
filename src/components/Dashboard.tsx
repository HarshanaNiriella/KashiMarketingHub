
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

const Dashboard = () => {
  const [lastMeeting, setLastMeeting] = useState<MeetingMinute | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-sage-800">Last Marketing Meeting</h3>
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
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          ✍️ Add Meeting Minutes
        </Button>
        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
          📱 Schedule Social Post
        </Button>
        <Button variant="outline" className="border-sage-200 text-sage-700 hover:bg-sage-50">
          📊 View Timeline
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
