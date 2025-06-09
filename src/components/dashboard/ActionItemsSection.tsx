
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Trash2 } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  assignee: string;
}

interface ActionItemsSectionProps {
  actionItems: ActionItem[];
  onStatusChange: (id: string, status: string) => void;
  onShowNotes: (item: { id: string; type: 'action' | 'social_post'; title: string }) => void;
  onDeleteClick: (id: string, type: 'action' | 'social') => void;
}

const ActionItemsSection = ({ 
  actionItems, 
  onStatusChange, 
  onShowNotes, 
  onDeleteClick 
}: ActionItemsSectionProps) => {
  const getStatusColor = (status: string) => {
    const variants = {
      pending: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      under_discussion: "bg-purple-100 text-purple-700 border-purple-200",
      delayed: "bg-orange-100 text-orange-700 border-orange-200"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <Card className="p-4 sm:p-6 border-sage-200">
      <h3 className="text-lg font-semibold text-sage-800 mb-4">🔥 Action Items</h3>
      <div className="space-y-4">
        {actionItems.map((item) => (
          <div key={item.id} className="p-3 sm:p-4 bg-white rounded-lg border border-sage-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sage-800 mb-1 truncate">{item.title}</h4>
                <p className="text-sm text-sage-600 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getStatusColor(item.status)} text-xs`}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-sage-500">Due: {item.dueDate}</span>
                  <span className="text-xs text-sage-500">Assigned: {item.assignee}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:ml-4 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShowNotes({ id: item.id, type: 'action', title: item.title })}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteClick(item.id, 'action')}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Select onValueChange={(value) => onStatusChange(item.id, value)}>
                  <SelectTrigger className="w-28 sm:w-32 h-8 text-xs border-sage-200">
                    <SelectValue placeholder="Update" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="under_discussion">Under Discussion</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActionItemsSection;
