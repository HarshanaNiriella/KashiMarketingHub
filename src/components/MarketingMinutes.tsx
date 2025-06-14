
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Staff {
  id: string;
  name: string;
  department: string;
  designation: string;
}

interface ActionItem {
  task: string;
  assignee: string;
  priority: string;
  status: string;
  due_date: string;
}

const MarketingMinutes = () => {
  const [meetingDate, setMeetingDate] = useState<Date>();
  const [duration, setDuration] = useState('');
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [nextMeetingDate, setNextMeetingDate] = useState<Date>();
  const [nextMeetingAgenda, setNextMeetingAgenda] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setAvailableStaff(data || []);
      console.log('Loaded staff for meeting minutes:', data?.length || 0);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        title: "Error",
        description: "Failed to load staff members.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendeeChange = (staffName: string, checked: boolean) => {
    if (checked) {
      setSelectedAttendees(prev => [...prev, staffName]);
    } else {
      setSelectedAttendees(prev => prev.filter(name => name !== staffName));
    }
  };

  const addActionItem = () => {
    setActionItems(prev => [...prev, {
      task: '',
      assignee: '',
      priority: 'medium',
      status: 'pending',
      due_date: ''
    }]);
  };

  const updateActionItem = (index: number, field: keyof ActionItem, value: string) => {
    setActionItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeActionItem = (index: number) => {
    setActionItems(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setMeetingDate(undefined);
    setDuration('');
    setSelectedAttendees([]);
    setNotes('');
    setNextMeetingDate(undefined);
    setNextMeetingAgenda('');
    setActionItems([]);
  };

  const validateForm = () => {
    if (!meetingDate) {
      toast({
        title: "Missing Information",
        description: "Please select a meeting date.",
        variant: "destructive"
      });
      return false;
    }

    if (selectedAttendees.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one attendee.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Save meeting minutes to Supabase
      const { data: meetingData, error: meetingError } = await supabase
        .from('meeting_minutes')
        .insert([{
          meeting_date: format(meetingDate!, 'yyyy-MM-dd'),
          duration,
          attendees: selectedAttendees,
          notes,
          next_meeting_date: nextMeetingDate ? format(nextMeetingDate, 'yyyy-MM-dd') : null,
          next_meeting_agenda: nextMeetingAgenda || null
        }])
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Save action items to Supabase
      if (actionItems.length > 0) {
        const actionItemsToSave = actionItems
          .filter(item => item.task.trim() && item.assignee.trim())
          .map(item => ({
            ...item,
            meeting_minutes_id: meetingData.id,
            due_date: item.due_date || null
          }));

        if (actionItemsToSave.length > 0) {
          const { error: actionError } = await supabase
            .from('action_items')
            .insert(actionItemsToSave);

          if (actionError) throw actionError;
        }
      }

      toast({
        title: "Success! 📝",
        description: "Meeting minutes saved successfully.",
      });

      resetForm();
    } catch (error) {
      console.error('Error saving meeting minutes:', error);
      toast({
        title: "Error",
        description: "Failed to save meeting minutes.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sage-600">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sage-800">📝 Marketing Meeting Minutes</h2>
      
      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📅 Meeting Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-sage-200",
                    !meetingDate && "text-sage-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {meetingDate ? format(meetingDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={meetingDate}
                  onSelect={setMeetingDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Duration</label>
            <Input 
              placeholder="e.g., 60 min"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border-sage-200"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">Attendees *</label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-sage-200 rounded-lg p-3">
            {availableStaff.length > 0 ? (
              availableStaff.map((staff) => (
                <div key={staff.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={staff.id}
                    checked={selectedAttendees.includes(staff.name)}
                    onCheckedChange={(checked) => handleAttendeeChange(staff.name, checked as boolean)}
                  />
                  <label htmlFor={staff.id} className="text-sm text-sage-700 cursor-pointer">
                    {staff.name} - {staff.designation}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sage-500 text-sm">No staff members available. Please add staff members first.</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Notes</label>
          <Textarea 
            placeholder="Document key discussion points, decisions made, and important topics covered..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 border-sage-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Next Meeting Date</label>
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
                  {nextMeetingDate ? format(nextMeetingDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextMeetingDate}
                  onSelect={setNextMeetingDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Next Meeting Agenda</label>
            <Input 
              placeholder="Brief agenda for next meeting"
              value={nextMeetingAgenda}
              onChange={(e) => setNextMeetingAgenda(e.target.value)}
              className="border-sage-200"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-sage-700">Action Items</label>
            <Button
              onClick={addActionItem}
              variant="outline"
              size="sm"
              className="border-sage-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Action Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div key={index} className="p-3 border border-sage-200 rounded-lg bg-sage-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <Input
                    placeholder="Task description"
                    value={item.task}
                    onChange={(e) => updateActionItem(index, 'task', e.target.value)}
                    className="border-sage-200"
                  />
                  <select
                    value={item.assignee}
                    onChange={(e) => updateActionItem(index, 'assignee', e.target.value)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-md text-sm"
                  >
                    <option value="">Select assignee</option>
                    {availableStaff.map((staff) => (
                      <option key={staff.id} value={staff.name}>{staff.name}</option>
                    ))}
                  </select>
                  <select
                    value={item.priority}
                    onChange={(e) => updateActionItem(index, 'priority', e.target.value)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-md text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={item.due_date}
                      onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
                      className="border-sage-200 flex-1"
                    />
                    <Button
                      onClick={() => removeActionItem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button 
            onClick={resetForm}
            variant="outline"
            className="border-sage-200 text-sage-700"
            disabled={isSubmitting}
          >
            Clear Form
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : '💾 Save Meeting Minutes'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MarketingMinutes;
