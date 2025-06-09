import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import TeamNotes from '@/components/TeamNotes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import ActionItemsSection from '@/components/dashboard/ActionItemsSection';
import SocialPostsSection from '@/components/dashboard/SocialPostsSection';
import AdminPasswordDialog from '@/components/dashboard/AdminPasswordDialog';

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

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setAdminPassword('');
    setDeleteItemId(null);
    setDeleteItemType(null);
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
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

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
