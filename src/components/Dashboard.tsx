import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, Clock, AlertCircle, Users, Trash2, Edit, MessageCircle, Send } from 'lucide-react';
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

interface DashboardProps {
  onSchedulePost: () => void;
  onViewTimeline: () => void;
  onAddMeetingMinutes: () => void;
}

// Get social posts from localStorage
const getSocialPosts = (): SocialPost[] => {
  try {
    const stored = localStorage.getItem('socialPosts');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading social posts:', error);
    return [];
  }
};

const Dashboard = ({ onSchedulePost, onViewTimeline, onAddMeetingMinutes }: DashboardProps) => {
  const [lastMeeting, setLastMeeting] = useState<MeetingMinute | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePassword, setDeletePassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const [itemToUpdate, setItemToUpdate] = useState<ActionItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [showSocialUpdateDialog, setShowSocialUpdateDialog] = useState(false);
  const [socialPostToUpdate, setSocialPostToUpdate] = useState<SocialPost | null>(null);
  const [newSocialStatus, setNewSocialStatus] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ type: string; id: string; title: string } | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    setSocialPosts(getSocialPosts());

    // Listen for storage changes to update social posts in real-time
    const handleStorageChange = () => {
      setSocialPosts(getSocialPosts());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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

  const handleUpdateStatusRequest = (item: ActionItem) => {
    setItemToUpdate(item);
    setNewStatus(item.status);
    setShowUpdateDialog(true);
    setAdminPassword('');
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

  const handleUpdateStatus = async () => {
    if (adminPassword !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Incorrect password.",
        variant: "destructive"
      });
      return;
    }

    if (!itemToUpdate) return;

    try {
      const { error } = await supabase
        .from('action_items')
        .update({ status: newStatus })
        .eq('id', itemToUpdate.id);

      if (error) throw error;

      // Update local state
      setActionItems(prev => 
        prev.map(item => 
          item.id === itemToUpdate.id 
            ? { ...item, status: newStatus }
            : item
        )
      );

      toast({
        title: "Success",
        description: "Action item status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive"
      });
    } finally {
      setShowUpdateDialog(false);
      setItemToUpdate(null);
      setAdminPassword('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'under_discussion': return <Users className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      delayed: "bg-orange-100 text-orange-700 border-orange-200",
      under_discussion: "bg-blue-100 text-blue-700 border-blue-200",
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      draft: "bg-purple-100 text-purple-700 border-purple-200",
      planned: "bg-sage-100 text-sage-700 border-sage-200"
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} capitalize`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const loadNotes = (itemType: string, itemId: string) => {
    try {
      const storageKey = `notes_${itemType}_${itemId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    }
  };

  const saveNotes = (itemType: string, itemId: string, updatedNotes: any[]) => {
    try {
      const storageKey = `notes_${itemType}_${itemId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleShowNotes = (type: string, id: string, title: string) => {
    setCurrentItem({ type, id, title });
    loadNotes(type, id);
    setShowNotesDialog(true);
    setNewNote('');
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !currentItem) return;

    const note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      author: 'Team Member' // In a real app, this would be the current user
    };

    const updatedNotes = [...notes, note];
    saveNotes(currentItem.type, currentItem.id, updatedNotes);
    setNewNote('');

    toast({
      title: "Note Added",
      description: "Your note has been added successfully.",
    });
  };

  const handleSocialStatusRequest = (post: SocialPost) => {
    setSocialPostToUpdate(post);
    setNewSocialStatus(post.status);
    setShowSocialUpdateDialog(true);
    setAdminPassword('');
  };

  const handleUpdateSocialStatus = () => {
    if (adminPassword !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Incorrect password.",
        variant: "destructive"
      });
      return;
    }

    if (!socialPostToUpdate) return;

    try {
      const updatedPosts = socialPosts.map(post =>
        post.id === socialPostToUpdate.id
          ? { ...post, status: newSocialStatus }
          : post
      );
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
      setSocialPosts(updatedPosts);

      toast({
        title: "Success",
        description: "Social media post status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating social post status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive"
      });
    } finally {
      setShowSocialUpdateDialog(false);
      setSocialPostToUpdate(null);
      setAdminPassword('');
    }
  };

  // Get upcoming social media posts (next 7 days)
  const getUpcomingSocialPosts = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return socialPosts
      .filter(post => {
        const postDate = new Date(post.date);
        return postDate >= today && postDate <= nextWeek && (post.status === 'scheduled' || post.status === 'planned');
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Show max 3 upcoming posts
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
  const upcomingPosts = getUpcomingSocialPosts();

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
                    onClick={() => handleShowNotes('action_item', task.id, task.task)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpdateStatusRequest(task)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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

      {/* Social Media Preview - Only show if there are upcoming posts */}
      {upcomingPosts.length > 0 && (
        <Card className="p-6 border-sage-200">
          <h3 className="text-lg font-semibold text-sage-800 mb-4">📱 Upcoming Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingPosts.map((post) => (
              <div key={post.id} className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-lg border border-purple-100">
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(post.status)}
                  <span className="text-sm text-sage-600">
                    {format(new Date(post.date), 'MMM d')}
                  </span>
                </div>
                <p className="font-medium text-sage-800 mb-1">
                  {post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
                </p>
                <p className="text-sm text-sage-600 mb-2">{post.platform} {post.type}</p>
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowNotes('social_post', post.id.toString(), post.content.substring(0, 30) + '...')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSocialStatusRequest(post)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Action Item Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Task: {itemToUpdate?.task}
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="border-sage-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="under_discussion">Under Discussion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Enter admin password to update:
              </label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
                className="border-sage-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Social Media Status Dialog */}
      <Dialog open={showSocialUpdateDialog} onOpenChange={setShowSocialUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Social Media Post Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Post: {socialPostToUpdate?.content.substring(0, 50)}...
              </label>
              <Select value={newSocialStatus} onValueChange={setNewSocialStatus}>
                <SelectTrigger className="border-sage-200">
                  <SelectValue placeholder="Select status" />
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
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Enter admin password to update:
              </label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSocialUpdateDialog(false)}
                className="border-sage-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSocialStatus}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>💬 Team Notes: {currentItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Notes List */}
            <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-sage-50 rounded-lg">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="bg-white p-3 rounded-lg border border-sage-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sage-800">{note.author}</span>
                      <span className="text-xs text-sage-500">
                        {format(new Date(note.timestamp), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sage-700">{note.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sage-600 text-center py-4">No notes yet. Be the first to add one!</p>
              )}
            </div>

            {/* Add Note */}
            <div className="flex space-x-2">
              <Textarea
                placeholder="Add a note for the team..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 border-sage-200 focus:border-emerald-300"
                rows={2}
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
