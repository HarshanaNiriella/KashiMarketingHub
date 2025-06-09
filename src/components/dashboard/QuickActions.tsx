
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, ListChecks } from 'lucide-react';

interface QuickActionsProps {
  onSchedulePost: () => void;
  onAddMeetingMinutes: () => void;
  onViewTimeline: () => void;
}

const QuickActions = ({ onSchedulePost, onAddMeetingMinutes, onViewTimeline }: QuickActionsProps) => {
  return (
    <Card className="p-4 sm:p-6 border-sage-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Button onClick={onSchedulePost} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          <CalendarClock className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">Schedule Post</span>
        </Button>
        <Button onClick={onAddMeetingMinutes} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          <ListChecks className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">Add Minutes</span>
        </Button>
        <Button onClick={onViewTimeline} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <CalendarClock className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">View Timeline</span>
        </Button>
      </div>
    </Card>
  );
};

export default QuickActions;
