
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Trash2 } from 'lucide-react';

interface SocialPost {
  id: number;
  content: string;
  platform: string;
  type: string;
  status: string;
  date: string;
  time: string;
}

interface SocialPostsSectionProps {
  upcomingSocialPosts: SocialPost[];
  onSocialPostStatusChange: (id: number, status: string) => void;
  onShowNotes: (item: { id: string; type: 'action' | 'social_post'; title: string }) => void;
  onDeleteClick: (id: string, type: 'action' | 'social') => void;
}

const SocialPostsSection = ({ 
  upcomingSocialPosts, 
  onSocialPostStatusChange, 
  onShowNotes, 
  onDeleteClick 
}: SocialPostsSectionProps) => {
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
                    onClick={() => onShowNotes({ id: post.id.toString(), type: 'social_post', title: post.content })}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClick(post.id.toString(), 'social')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Select onValueChange={(value) => onSocialPostStatusChange(post.id, value)}>
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
  );
};

export default SocialPostsSection;
