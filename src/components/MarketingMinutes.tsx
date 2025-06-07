
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Plus, User, Check } from 'lucide-react';
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

const MarketingMinutes = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [nextMeetingDate, setNextMeetingDate] = useState<Date>();
  const [duration, setDuration] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [nextMeetingAgenda, setNextMeetingAgenda] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { task: '', assignee: '', priority: 'medium' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const teamMembers = ['Sarah', 'Mike', 'Anna', 'Dr. Harshana', 'Lisa'];

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
      <Card className="p-6 border-sage-200">
        <h2 className="text-2xl font-semibold text-sage-800 mb-6">✍️ Marketing Meeting Minutes</h2>
        
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
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <Button
                key={member}
                variant={selectedAttendees.includes(member) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAttendee(member)}
                className={cn(
                  "border-sage-200",
                  selectedAttendees.includes(member) 
                    ? "bg-emerald-600 text-white border-emerald-600" 
                    : "text-sage-700 hover:bg-emerald-50 hover:border-emerald-300"
                )}
              >
                <User className="h-3 w-3 mr-1" />
                {member}
                {selectedAttendees.includes(member) && <Check className="h-3 w-3 ml-1" />}
              </Button>
            ))}
          </div>
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
                      <SelectItem key={member} value={member}>{member}</SelectItem>
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

      {/* Next Meeting */}
      <Card className="p-6 border-sage-200 bg-gradient-to-br from-white to-blue-50">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">🗓️ Next Meeting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Scheduled Date</label>
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
                  {nextMeetingDate ? format(nextMeetingDate, "PPP") : "Pick next meeting date"}
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
            <label className="block text-sm font-medium text-sage-700 mb-2">Agenda Items</label>
            <Input 
              placeholder="e.g., Review action items, Plan holiday campaign" 
              value={nextMeetingAgenda}
              onChange={(e) => setNextMeetingAgenda(e.target.value)}
              className="border-sage-200 focus:border-emerald-300"
            />
          </div>
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
    </div>
  );
};

export default MarketingMinutes;
