
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ScheduleSocialPostProps {
  onBack: () => void;
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

const ScheduleSocialPost = ({ onBack }: ScheduleSocialPostProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [platform, setPlatform] = useState('');
  const [postType, setPostType] = useState('');
  const [content, setContent] = useState('');
  const [time, setTime] = useState('');
  const [mediaType, setMediaType] = useState('');
  const { toast } = useToast();

  const getSocialPosts = (): SocialPost[] => {
    try {
      const stored = localStorage.getItem('socialPosts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading social posts:', error);
      return [];
    }
  };

  const saveSocialPost = (post: SocialPost, status: string) => {
    try {
      const existingPosts = getSocialPosts();
      const newPost = { ...post, status };
      const updatedPosts = [...existingPosts, newPost];
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
      return true;
    } catch (error) {
      console.error('Error saving social post:', error);
      return false;
    }
  };

  const validateForm = () => {
    if (!selectedDate || !platform || !postType || !content || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const createPostObject = (status: string): SocialPost => {
    const existingPosts = getSocialPosts();
    const newId = existingPosts.length > 0 ? Math.max(...existingPosts.map(p => p.id)) + 1 : 1;
    
    return {
      id: newId,
      content,
      platform,
      type: postType,
      status,
      date: format(selectedDate!, 'yyyy-MM-dd'),
      time,
      media: mediaType || 'text'
    };
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setPlatform('');
    setPostType('');
    setContent('');
    setTime('');
    setMediaType('');
  };

  const handleSaveAsDraft = () => {
    if (!validateForm()) return;

    const post = createPostObject('draft');
    if (saveSocialPost(post, 'draft')) {
      toast({
        title: "Draft Saved! 📝",
        description: "Social media post saved as draft.",
      });
      resetForm();
    } else {
      toast({
        title: "Error",
        description: "Failed to save draft.",
        variant: "destructive"
      });
    }
  };

  const handleSchedulePost = () => {
    if (!validateForm()) return;

    const post = createPostObject('scheduled');
    if (saveSocialPost(post, 'scheduled')) {
      toast({
        title: "Success! 🎉",
        description: "Social media post scheduled successfully.",
      });
      resetForm();
    } else {
      toast({
        title: "Error",
        description: "Failed to schedule post.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-sage-700 hover:bg-sage-50"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold text-sage-800">📱 Schedule Social Media Post</h2>
      </div>

      <Card className="p-6 border-purple-200 bg-gradient-to-br from-white to-purple-50">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">✨ Create New Social Media Post</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="border-sage-200 focus:border-purple-300">
              <SelectValue placeholder="Select platform *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">📸 Instagram</SelectItem>
              <SelectItem value="Facebook">📘 Facebook</SelectItem>
              <SelectItem value="Twitter">🐦 Twitter</SelectItem>
              <SelectItem value="LinkedIn">💼 LinkedIn</SelectItem>
            </SelectContent>
          </Select>

          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger className="border-sage-200 focus:border-purple-300">
              <SelectValue placeholder="Post type *" />
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
          <label className="block text-sm font-medium text-sage-700 mb-2">Post Content *</label>
          <Textarea 
            placeholder="Write your post content here... Use emojis to make it engaging! ✨"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 border-sage-200 focus:border-purple-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Schedule Date *</label>
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
            <label className="block text-sm font-medium text-sage-700 mb-2">Time *</label>
            <Input 
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border-sage-200 focus:border-purple-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Media Type</label>
            <Select value={mediaType} onValueChange={setMediaType}>
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
            onClick={onBack}
            className="border-sage-200 text-sage-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAsDraft}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            💾 Save as Draft
          </Button>
          <Button 
            onClick={handleSchedulePost}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            📅 Schedule Post
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ScheduleSocialPost;
