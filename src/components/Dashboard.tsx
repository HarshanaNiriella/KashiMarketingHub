import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, ListChecks, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import TeamNotes from '@/components/TeamNotes';

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

const Dashboard = ({ onSchedulePost, onViewTimeline, onAddMeetingMinutes }: DashboardProps) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [upcomingSocialPosts, setUpcomingSocialPosts] = useState<SocialPost[]>([]);
  const { toast } = useToast();

  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ id: string; type: 'action' | 'social_post'; title: string } | null>(null);

  useEffect(() => {
    loadActionItems();
    loadSocialPosts();
  }, []);

  const loadActionItems = () => {
    try {
      const stored = localStorage.getItem('actionItems');
      if (stored) {
        setActionItems(JSON.parse(stored));
      } else {
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
        setActionItems(defaultActions);
        localStorage.setItem('actionItems', JSON.stringify(defaultActions));
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
        // Filter posts to only include those with a date in the future
        const upcomingPosts = posts.filter((post: SocialPost) => {
          const postDate = new Date(post.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Compare only dates, not times
          return postDate >= today;
        });
        
        setUpcomingSocialPosts(upcomingPosts);
      } else {
        setUpcomingSocialPosts([]);
      }
    } catch (error) {
      console.error('Error loading social posts:', error);
      setUpcomingSocialPosts([]);
    }
  };

  const saveActionItems = (items: ActionItem[]) => {
    try {
      localStorage.setItem('actionItems', JSON.stringify(items));
      setActionItems(items);
    } catch (error) {
      console.error('Error saving action items:', error);
    }
  };

  const saveSocialPosts = (posts: SocialPost[]) => {
    try {
      localStorage.setItem('socialPosts', JSON.stringify(posts));
      loadSocialPosts(); // Reload to update the upcoming posts
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

  const getStatusColor = (status: string) => {
    const variants = {
      pending: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      under_discussion: "bg-purple-100 text-purple-700 border-purple-200",
      delayed: "bg-orange-100 text-orange-700 border-orange-200"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPostStatusColor = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-700",
      draft: "bg-purple-100 text-purple-700",
      planned: "bg-sage-100 text-sage-700",
      posted: "bg-emerald-100 text-emerald-700",
      delayed: "bg-orange-100 text-orange-700",
      still_designing: "bg-pink-100 text-pink-700"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700";
  };

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case 'Instagram': return '📸';
      case 'Facebook': return '📘';
      case 'Twitter': return '🐦';
      case 'LinkedIn': return '💼';
      default: return '📱';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-6 border-sage-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Button onClick={onSchedulePost} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <CalendarClock className="h-4 w-4 mr-2" />
              Schedule Post
            </Button>
          </div>
          <div className="text-center">
            <Button onClick={onAddMeetingMinutes} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <ListChecks className="h-4 w-4 mr-2" />
              Add Minutes
            </Button>
          </div>
          <div className="text-center">
            <Button onClick={onViewTimeline} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <CalendarClock className="h-4 w-4 mr-2" />
              View Timeline
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Items */}
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">🔥 Action Items</h3>
        <div className="space-y-4">
          {actionItems.map((item) => (
            <div key={item.id} className="p-4 bg-white rounded-lg border border-sage-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sage-800 mb-1">{item.title}</h4>
                  <p className="text-sm text-sage-600 mb-2">{item.description}</p>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getStatusColor(item.status)} text-xs`}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-sage-500">Due: {item.dueDate}</span>
                    <span className="text-xs text-sage-500">Assigned: {item.assignee}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowNotes({ id: item.id, type: 'action', title: item.title })}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Select onValueChange={(value) => handleStatusChange(item.id, value)}>
                    <SelectTrigger className="w-32 h-8 text-xs border-sage-200">
                      <SelectValue placeholder="Update" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="under_discussion">Under Discussion</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Social Media Posts */}
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📣 Upcoming Social Media Posts</h3>
        <div className="space-y-4">
          {upcomingSocialPosts.map((post) => (
            <div key={post.id} className="p-4 bg-gradient-to-r from-white to-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getPlatformEmoji(post.platform)}</span>
                    <span className="font-medium text-sage-800">{post.platform}</span>
                    <Badge className={getPostStatusColor(post.status)}>{post.status}</Badge>
                  </div>
                  <p className="text-sm text-sage-700 mb-2">{post.content.substring(0, 100)}...</p>
                  <div className="flex items-center space-x-3 text-xs text-sage-500">
                    <span>📅 {post.date}</span>
                    <span>🕒 {post.time}</span>
                    <span className="capitalize">{post.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowNotes({ id: post.id.toString(), type: 'social_post', title: post.content })}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Select onValueChange={(value) => handleSocialPostStatusChange(post.id, value)}>
                    <SelectTrigger className="w-32 h-8 text-xs border-sage-200">
                      <SelectValue placeholder="Update" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="still_designing">Still Designing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
