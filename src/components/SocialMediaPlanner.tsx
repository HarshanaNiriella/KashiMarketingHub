import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Image, Video, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Load social posts from localStorage
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    loadSocialPosts();
  }, []);

  const loadSocialPosts = () => {
    try {
      const stored = localStorage.getItem('socialPosts');
      if (stored) {
        setSocialPosts(JSON.parse(stored));
      } else {
        // Initialize with default posts if none exist
        const defaultPosts = [
          {
            id: 1,
            content: "Start your morning with gratitude 🙏 What are three things you're grateful for today?",
            platform: "Instagram",
            type: "post",
            status: "scheduled",
            date: "2024-12-08",
            time: "07:00",
            media: "image"
          },
          {
            id: 2,
            content: "Wellness Wednesday: The power of breathwork in reducing stress and anxiety. Join our evening session!",
            platform: "Facebook",
            type: "event",
            status: "draft",
            date: "2024-12-10",
            time: "18:00",
            media: "video"
          },
          {
            id: 3,
            content: "New retreat photos from our weekend mindfulness session ✨ #KashiWellness #Mindfulness",
            platform: "Instagram",
            type: "carousel",
            status: "planned",
            date: "2024-12-12",
            time: "15:00",
            media: "image"
          }
        ];
        setSocialPosts(defaultPosts);
        localStorage.setItem('socialPosts', JSON.stringify(defaultPosts));
      }
    } catch (error) {
      console.error('Error loading social posts:', error);
    }
  };

  const saveSocialPosts = (posts: SocialPost[]) => {
    try {
      localStorage.setItem('socialPosts', JSON.stringify(posts));
      setSocialPosts(posts);
    } catch (error) {
      console.error('Error saving social posts:', error);
    }
  };

  const handleDeleteRequest = (postId: number) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
    setDeletePassword('');
  };

  const handleDelete = () => {
    if (deletePassword !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Incorrect password.",
        variant: "destructive"
      });
      return;
    }

    if (postToDelete !== null) {
      const updatedPosts = socialPosts.filter(post => post.id !== postToDelete);
      saveSocialPosts(updatedPosts);
      toast({
        title: "Success",
        description: "Social media post deleted successfully.",
      });
    }

    setShowDeleteDialog(false);
    setPostToDelete(null);
    setDeletePassword('');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      draft: "bg-purple-100 text-purple-700 border-purple-200",
      planned: "bg-sage-100 text-sage-700 border-sage-200",
      posted: "bg-emerald-100 text-emerald-700 border-emerald-200",
      delayed: "bg-orange-100 text-orange-700 border-orange-200"
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} capitalize`}>
        {status}
      </Badge>
    );
  };

  const getMediaIcon = (media: string) => {
    switch (media) {
      case 'image': return <Image className="h-4 w-4 text-sage-600" />;
      case 'video': return <Video className="h-4 w-4 text-sage-600" />;
      case 'text': return <FileText className="h-4 w-4 text-sage-600" />;
      default: return null;
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-sage-800">📱 Social Media Planner</h2>
        <Button 
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Schedule New Post
        </Button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <Card className="p-6 border-purple-200 bg-gradient-to-br from-white to-purple-50">
          <h3 className="text-lg font-semibold text-sage-800 mb-4">✨ Create New Social Media Post</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select>
              <SelectTrigger className="border-sage-200 focus:border-purple-300">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">📸 Instagram</SelectItem>
                <SelectItem value="facebook">📘 Facebook</SelectItem>
                <SelectItem value="twitter">🐦 Twitter</SelectItem>
                <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="border-sage-200 focus:border-purple-300">
                <SelectValue placeholder="Post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">📝 Regular Post</SelectItem>
                <SelectItem value="story">📱 Story</SelectItem>
                <SelectItem value="reel">🎬 Reel</SelectItem>
                <SelectItem value="carousel">🎠 Carousel</SelectItem>
                <SelectItem value="event">📅 Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-sage-700 mb-2">Post Content</label>
            <Textarea 
              placeholder="Write your post content here... Use emojis to make it engaging! ✨"
              className="min-h-24 border-sage-200 focus:border-purple-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">Schedule Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-sage-200",
                      !selectedDate && "text-sage-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">Time</label>
              <Input 
                type="time" 
                className="border-sage-200 focus:border-purple-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">Media Type</label>
              <Select>
                <SelectTrigger className="border-sage-200 focus:border-purple-300">
                  <SelectValue placeholder="Media" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">🖼️ Image</SelectItem>
                  <SelectItem value="video">🎥 Video</SelectItem>
                  <SelectItem value="text">📝 Text Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowNewPostForm(false)}
              className="border-sage-200 text-sage-700"
            >
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              💾 Save as Draft
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              ⏰ Schedule Post
            </Button>
          </div>
        </Card>
      )}

      {/* Posts Timeline */}
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📅 Upcoming & Recent Posts</h3>
        
        <div className="space-y-4">
          {socialPosts.map((post) => (
            <div key={post.id} className="p-4 border border-sage-200 rounded-lg bg-gradient-to-r from-white to-sage-50 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getPlatformEmoji(post.platform)}</span>
                  <div>
                    <p className="font-medium text-sage-800">{post.platform}</p>
                    <p className="text-sm text-sage-600 capitalize">{post.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getMediaIcon(post.media)}
                  {getStatusBadge(post.status)}
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

              <p className="text-sage-700 mb-3 leading-relaxed">{post.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-sage-600">
                  <span>📅 {post.date}</span>
                  <span>🕒 {post.time}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                    Duplicate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Analytics Overview */}
      <Card className="p-6 border-sage-200 bg-gradient-to-br from-white to-emerald-50">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📊 This Week's Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">8</p>
            <p className="text-sm text-sage-600">Posts Scheduled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">3</p>
            <p className="text-sm text-sage-600">Drafts Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-sage-600">Posts Published</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">2</p>
            <p className="text-sm text-sage-600">Needs Review</p>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
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
