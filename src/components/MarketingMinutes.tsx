
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Plus, User, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActionItem {
  id?: string;
  task: string;
  assignee: string;
  priority: string;
  status?: string;
  due_date?: string;
}

interface MeetingMinute {
  id?: string;
  meeting_date: string;
  duration: string;
  attendees: string[];
  notes: string;
  next_meeting_date?: string;
  next_meeting_agenda?: string;
}

interface Staff {
  id: string;
  name: string;
  department: string;
  designation: string;
}

const MarketingMinutes = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [nextMeetingDate, setNextMeetingDate] = useState<Date>();
  const [nextMeetingTime, setNextMeetingTime] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [nextMeetingAgenda, setNextMeetingAgenda] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { task: '', assignee: '', priority: 'medium' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Staff[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = () => {
    try {
      const stored = localStorage.getItem('staff');
      if (stored) {
        setTeamMembers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const addActionItem = () => {
    setActionItems([
      ...actionItems,
      { task: '', assignee: '', priority: 'medium' }
    ]);
  };

  const updateActionItem = (index: number, field: string, value: string) => {
    setActionItems(actionItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeActionItem = (index: number) => {
    if (actionItems.length > 1) {
      setActionItems(actionItems.filter((_, i) => i !== index));
    }
  };

  const toggleAttendee = (member: string) => {
    setSelectedAttendees(prev => 
      prev.includes(member) 
        ? prev.filter(m => m !== member)
        : [...prev, member]
    );
  };

  const scheduleNextMeeting = async () => {
    if (!nextMeetingDate || !nextMeetingTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for the next meeting.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the most recent meeting to update
      const { data: meetings, error: meetingError } = await supabase
        .from('meeting_minutes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (meetingError) throw meetingError;

      if (meetings && meetings.length > 0) {
        const { error: updateError } = await supabase
          .from('meeting_minutes')
          .update({ 
            next_meeting_date: format(nextMeetingDate, 'yyyy-MM-dd'),
            next_meeting_agenda: nextMeetingAgenda || undefined
          })
          .eq('id', meetings[0].id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success! 📅",
        description: `Next meeting scheduled for ${format(nextMeetingDate, 'PPP')} at ${nextMeetingTime}`,
      });

      setShowScheduleDialog(false);
      setNextMeetingDate(undefined);
      setNextMeetingTime('');
      setNextMeetingAgenda('');

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveMeetingMinutes = async () => {
    if (!selectedDate || !duration || selectedAttendees.length === 0 || !meetingNotes) {
      toast({
        title: "Missing Information",
        description: "Please fill in meeting date, duration, attendees, and notes.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save meeting minutes
      const meetingData: MeetingMinute = {
        meeting_date: format(selectedDate, 'yyyy-MM-dd'),
        duration,
        attendees: selectedAttendees,
        notes: meetingNotes,
        next_meeting_date: nextMeetingDate ? format(nextMeetingDate, 'yyyy-MM-dd') : undefined,
        next_meeting_agenda: nextMeetingAgenda || undefined
      };

      const { data: meetingMinutes, error: meetingError } = await supabase
        .from('meeting_minutes')
        .insert(meetingData)
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Save action items
      const validActionItems = actionItems.filter(item => item.task && item.assignee);
      
      if (validActionItems.length > 0) {
        const actionItemsData = validActionItems.map(item => ({
          meeting_minutes_id: meetingMinutes.id,
          task: item.task,
          assignee: item.assignee,
          priority: item.priority,
          status: 'pending'
        }));

        const { error: actionItemsError } = await supabase
          .from('action_items')
          .insert(actionItemsData);

        if (actionItemsError) throw actionItemsError;
      }

      toast({
        title: "Success! 🎉",
        description: "Meeting minutes saved successfully.",
      });

      // Reset form
      setSelectedDate(undefined);
      setNextMeetingDate(undefined);
      setDuration('');
      setSelectedAttendees([]);
      setMeetingNotes('');
      setNextMeetingAgenda('');
      setActionItems([{ task: '', assignee: '', priority: 'medium' }]);

    } catch (error) {
      console.error('Error saving meeting minutes:', error);
      toast({
        title: "Error",
        description: "Failed to save meeting minutes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-sage-800">✍️ Marketing Meeting Minutes</h2>
        <Button 
          onClick={() => setShowScheduleDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Clock className="h-4 w-4 mr-1" />
          Schedule Next Meeting
        </Button>
      </div>

      <Card className="p-6 border-sage-200">
        {/* Meeting Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Date *</label>
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
            <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Duration *</label>
            <Input 
              placeholder="e.g., 45 minutes" 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border-sage-200 focus:border-emerald-300"
            />
          </div>
        </div>

        {/* Attendees */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">Attendees *</label>
          {teamMembers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <Button
                  key={member.id}
                  variant={selectedAttendees.includes(member.name) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAttendee(member.name)}
                  className={cn(
                    "border-sage-200",
                    selectedAttendees.includes(member.name) 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : "text-sage-700 hover:bg-emerald-50 hover:border-emerald-300"
                  )}
                >
                  <User className="h-3 w-3 mr-1" />
                  {member.name}
                  {selectedAttendees.includes(member.name) && <Check className="h-3 w-3 ml-1" />}
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-700">No staff members available. Please add staff members in Staff Management first.</p>
            </div>
          )}
        </div>

        {/* Meeting Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Notes & Discussion *</label>
          <Textarea 
            placeholder="Add key discussion points, decisions made, and important notes from the meeting..."
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            className="min-h-32 border-sage-200 focus:border-emerald-300"
          />
        </div>
      </Card>

      {/* Action Items */}
      <Card className="p-6 border-sage-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-sage-800">🎯 Action Items</h3>
          <Button 
            onClick={addActionItem}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {actionItems.map((item, index) => (
            <div key={index} className="p-4 bg-sage-50 rounded-lg border border-sage-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Describe the action item..."
                    value={item.task}
                    onChange={(e) => updateActionItem(index, 'task', e.target.value)}
                    className="border-sage-200 focus:border-emerald-300"
                  />
                </div>
                
                <Select value={item.assignee} onValueChange={(value) => updateActionItem(index, 'assignee', value)}>
                  <SelectTrigger className="border-sage-200 focus:border-emerald-300">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={item.priority} onValueChange={(value) => updateActionItem(index, 'priority', value)}>
                  <SelectTrigger className="border-sage-200 focus:border-emerald-300">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {actionItems.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeActionItem(index)}
                  className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveMeetingMinutes}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
        >
          {isLoading ? 'Saving...' : '💾 Save Meeting Minutes'}
        </Button>
      </div>

      {/* Schedule Next Meeting Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-sage-800 mb-4">📅 Schedule Next Meeting</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-sage-200",
                        !nextMeetingDate && "text-sage-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextMeetingDate ? format(nextMeetingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={nextMeetingDate}
                      onSelect={setNextMeetingDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Time *</label>
                <Input 
                  type="time"
                  value={nextMeetingTime}
                  onChange={(e) => setNextMeetingTime(e.target.value)}
                  className="border-sage-200 focus:border-emerald-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Agenda Items</label>
                <Textarea 
                  placeholder="e.g., Review action items, Plan holiday campaign" 
                  value={nextMeetingAgenda}
                  onChange={(e) => setNextMeetingAgenda(e.target.value)}
                  className="border-sage-200 focus:border-emerald-300"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="border-sage-200"
              >
                Cancel
              </Button>
              <Button
                onClick={scheduleNextMeeting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Schedule Meeting
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MarketingMinutes;
