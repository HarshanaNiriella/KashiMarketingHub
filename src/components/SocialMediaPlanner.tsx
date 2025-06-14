
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import ScheduleSocialPost from './ScheduleSocialPost';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

const SocialMediaPlanner = () => {
  const [currentView, setCurrentView] = useState<'planner' | 'schedule'>('planner');
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SocialPost[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSocialPosts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('social-posts-planner')
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterPosts();
  }, [socialPosts, filterStatus, filterPlatform]);

  const loadSocialPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      setSocialPosts(data || []);
      console.log('Loaded social posts:', data?.length || 0);
    } catch (error) {
      console.error('Error loading social posts:', error);
      toast({
        title: "Error",
        description: "Failed to load social posts.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...socialPosts];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === filterStatus);
    }

    if (filterPlatform !== 'all') {
      filtered = filtered.filter(post => post.platform === filterPlatform);
    }

    setFilteredPosts(filtered);
  };

  const handleStatusChange = async (postId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ status: newStatus })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Post status updated to ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Error",
        description: "Failed to update post status.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRequest = (postId: number) => {
    setPostToDelete(postId);
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

    if (postToDelete) {
      try {
        const { error } = await supabase
          .from('social_posts')
          .delete()
          .eq('id', postToDelete);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Social media post deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        toast({
          title: "Error",
          description: "Failed to delete post.",
          variant: "destructive"
        });
      }
    }

    setShowDeleteDialog(false);
    setPostToDelete(null);
    setDeletePassword('');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-700",
      draft: "bg-purple-100 text-purple-700",
      planned: "bg-sage-100 text-sage-700",
      posted: "bg-emerald-100 text-emerald-700",
      delayed: "bg-orange-100 text-orange-700",
      still_designing: "bg-pink-100 text-pink-700"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700"}>
        {status.replace('_', ' ')}
      </Badge>
    );
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

  if (currentView === 'schedule') {
    return <ScheduleSocialPost onBack={() => setCurrentView('planner')} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sage-600">Loading social posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-sage-800">📱 Social Media Planner</h2>
        <Button 
          onClick={() => setCurrentView('schedule')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          📅 Schedule New Post
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 border-sage-200">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
            <SelectItem value="still_designing">Still Designing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-48 border-sage-200">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="Instagram">📸 Instagram</SelectItem>
            <SelectItem value="Facebook">📘 Facebook</SelectItem>
            <SelectItem value="Twitter">🐦 Twitter</SelectItem>
            <SelectItem value="LinkedIn">💼 LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📋 All Social Media Posts</h3>
        
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="p-4 bg-gradient-to-r from-white to-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getPlatformEmoji(post.platform)}</span>
                      <span className="font-medium text-sage-800">{post.platform}</span>
                      {getStatusBadge(post.status)}
                      <span className="text-xs bg-sage-200 text-sage-700 px-2 py-1 rounded capitalize">
                        {post.type}
                      </span>
                    </div>
                    <p className="text-sage-700 mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-sage-500">
                      <span>📅 {format(new Date(post.date), 'MMM d, yyyy')}</span>
                      <span>🕒 {post.time}</span>
                      {post.media && <span>🎬 {post.media}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Select onValueChange={(value) => handleStatusChange(post.id, value)}>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRequest(post.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sage-600 text-center py-8">
              {socialPosts.length === 0 
                ? "No social media posts scheduled yet. Click 'Schedule New Post' to get started!" 
                : "No posts match the current filters."}
            </p>
          )}
        </div>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Social Media Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sage-600">Enter password to delete this post:</p>
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

export default SocialMediaPlanner;
