
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MarketingMinutes = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [actionItems, setActionItems] = useState([
    { id: 1, task: '', assignee: '', dueDate: '', priority: 'medium' }
  ]);

  const addActionItem = () => {
    setActionItems([
      ...actionItems,
      { id: Date.now(), task: '', assignee: '', dueDate: '', priority: 'medium' }
    ]);
  };

  const updateActionItem = (id: number, field: string, value: string) => {
    setActionItems(actionItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeActionItem = (id: number) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  const teamMembers = ['Sarah', 'Mike', 'Anna', 'Dr. Harshana', 'Lisa'];

  return (
    <div className="space-y-6">
      <Card className="p-6 border-sage-200">
        <h2 className="text-2xl font-semibold text-sage-800 mb-6">✍️ Marketing Meeting Minutes</h2>
        
        {/* Meeting Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Date</label>
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
            <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Duration</label>
            <Input 
              placeholder="e.g., 45 minutes" 
              className="border-sage-200 focus:border-emerald-300"
            />
          </div>
        </div>

        {/* Attendees */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">Attendees</label>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <Button
                key={member}
                variant="outline"
                size="sm"
                className="border-sage-200 text-sage-700 hover:bg-emerald-50 hover:border-emerald-300"
              >
                <User className="h-3 w-3 mr-1" />
                {member}
              </Button>
            ))}
          </div>
        </div>

        {/* Meeting Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">Meeting Notes & Discussion</label>
          <Textarea 
            placeholder="Add key discussion points, decisions made, and important notes from the meeting..."
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
            <div key={item.id} className="p-4 bg-sage-50 rounded-lg border border-sage-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Describe the action item..."
                    value={item.task}
                    onChange={(e) => updateActionItem(item.id, 'task', e.target.value)}
                    className="border-sage-200 focus:border-emerald-300"
                  />
                </div>
                
                <Select value={item.assignee} onValueChange={(value) => updateActionItem(item.id, 'assignee', value)}>
                  <SelectTrigger className="border-sage-200 focus:border-emerald-300">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={item.priority} onValueChange={(value) => updateActionItem(item.id, 'priority', value)}>
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
                  onClick={() => removeActionItem(item.id)}
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
                  className="w-full justify-start text-left font-normal border-sage-200"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Pick next meeting date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
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
              className="border-sage-200 focus:border-emerald-300"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
          💾 Save Meeting Minutes
        </Button>
      </div>
    </div>
  );
};

export default MarketingMinutes;
