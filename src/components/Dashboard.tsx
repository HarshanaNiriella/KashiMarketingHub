import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, ListChecks, MessageCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import TeamNotes from '@/components/TeamNotes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<'action' | 'social' | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { toast } = useToast();

  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ id: string; type: 'action' | 'social_post'; title: string } | null>(null);

  // Admin password - in production, this should be more secure
  const ADMIN_PASSWORD = 'admin123';

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
        // Filter posts to only include those with a date in the future and status scheduled/planned
        const upcomingPosts = posts.filter((post: SocialPost) => {
          const postDate = new Date(post.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return postDate >= today && ['scheduled', 'planned'].includes(post.status);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      loadActionItems();
      loadSocialPosts();
      toast({
        title: "Data Refreshed",
        description: "All data has been synchronized.",
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
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
      loadSocialPosts();
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-sage-800">Dashboard</h2>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-sage-200"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-6 border-sage-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Button onClick={onSchedulePost} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            <CalendarClock className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Schedule Post</span>
          </Button>
          <Button onClick={onAddMeetingMinutes} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            <ListChecks className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Add Minutes</span>
          </Button>
          <Button onClick={onViewTimeline} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <CalendarClock className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">View Timeline</span>
          </Button>
        </div>
      </Card>

      {/* Action Items */}
      <Card className="p-4 sm:p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">🔥 Action Items</h3>
        <div className="space-y-4">
          {actionItems.map((item) => (
            <div key={item.id} className="p-3 sm:p-4 bg-white rounded-lg border border-sage-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sage-800 mb-1 truncate">{item.title}</h4>
                  <p className="text-sm text-sage-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getStatusColor(item.status)} text-xs`}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-sage-500">Due: {item.dueDate}</span>
                    <span className="text-xs text-sage-500">Assigned: {item.assignee}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:ml-4 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowNotes({ id: item.id, type: 'action', title: item.title })}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(item.id, 'action')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Select onValueChange={(value) => handleStatusChange(item.id, value)}>
                    <SelectTrigger className="w-28 sm:w-32 h-8 text-xs border-sage-200">
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
      <Card className="p-4 sm:p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📣 Upcoming Social Media Posts</h3>
        <div className="space-y-4">
          {upcomingSocialPosts.length > 0 ? (
            upcomingSocialPosts.map((post) => (
              <div key={post.id} className="p-3 sm:p-4 bg-gradient-to-r from-white to-purple-50 rounded-lg border border-purple-200">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-lg">{getPlatformEmoji(post.platform)}</span>
                      <span className="font-medium text-sage-800">{post.platform}</span>
                      <Badge className={getPostStatusColor(post.status)}>{post.status}</Badge>
                    </div>
                    <p className="text-sm text-sage-700 mb-2 line-clamp-2">{post.content.substring(0, 100)}...</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-sage-500">
                      <span>📅 {post.date}</span>
                      <span>🕒 {post.time}</span>
                      <span className="capitalize">{post.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:ml-4 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowNotes({ id: post.id.toString(), type: 'social_post', title: post.content })}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(post.id.toString(), 'social')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Select onValueChange={(value) => handleSocialPostStatusChange(post.id, value)}>
                      <SelectTrigger className="w-28 sm:w-32 h-8 text-xs border-sage-200">
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
            ))
          ) : (
            <p className="text-sage-600 text-center py-8">No upcoming scheduled or planned social media posts</p>
          )}
        </div>
      </Card>

      {/* Admin Password Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Admin Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the admin password to delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDeleteConfirm();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPasswordDialog(false);
              setAdminPassword('');
              setDeleteItemId(null);
              setDeleteItemType(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
