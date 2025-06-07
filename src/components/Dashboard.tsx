
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const lastMeetingDate = "December 1, 2024";
  const nextMeetingDate = "December 8, 2024";
  
  const recentTasks = [
    { id: 1, task: "Create Instagram story templates", status: "completed", assignee: "Sarah" },
    { id: 2, task: "Plan December newsletter", status: "pending", assignee: "Mike" },
    { id: 3, task: "Update website banner", status: "delayed", assignee: "Anna", reason: "Waiting for new photos" }
  ];

  const upcomingSocialPosts = [
    { id: 1, content: "Morning meditation tips", platform: "Instagram", date: "Dec 8", status: "scheduled" },
    { id: 2, content: "Wellness Wednesday quote", platform: "Facebook", date: "Dec 10", status: "draft" },
    { id: 3, content: "New retreat photos", platform: "Instagram", date: "Dec 12", status: "planned" }
  ];

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

  return (
    <div className="space-y-6">
      {/* Meeting Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-sage-200 bg-gradient-to-br from-white to-emerald-50">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-sage-800">Last Marketing Meeting</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mb-2">{lastMeetingDate}</p>
          <p className="text-sm text-sage-600">3 action items assigned • 1 completed, 1 pending, 1 delayed</p>
        </Card>

        <Card className="p-6 border-sage-200 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-sage-800">Next Marketing Meeting</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-2">{nextMeetingDate}</p>
          <p className="text-sm text-sage-600">In 5 days • Review pending items</p>
        </Card>
      </div>

      {/* Action Items Status */}
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📋 Current Action Items</h3>
        <div className="space-y-3">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg border border-sage-100">
              <div className="flex items-center space-x-3">
                {getStatusIcon(task.status)}
                <div>
                  <p className="font-medium text-sage-800">{task.task}</p>
                  <p className="text-sm text-sage-600">Assigned to: {task.assignee}</p>
                  {task.reason && (
                    <p className="text-xs text-orange-600 mt-1">Reason: {task.reason}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(task.status)}
            </div>
          ))}
        </div>
      </Card>

      {/* Social Media Preview */}
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📱 Upcoming Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingSocialPosts.map((post) => (
            <div key={post.id} className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-lg border border-purple-100">
              <div className="flex justify-between items-start mb-2">
                {getStatusBadge(post.status)}
                <span className="text-sm text-sage-600">{post.date}</span>
              </div>
              <p className="font-medium text-sage-800 mb-1">{post.content}</p>
              <p className="text-sm text-sage-600">{post.platform}</p>
            </div>
          ))}
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
