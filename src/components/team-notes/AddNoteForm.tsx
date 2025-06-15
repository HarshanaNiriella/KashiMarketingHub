
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  department: string;
  designation: string;
}

interface AddNoteFormProps {
  staff: Staff[];
  onAddNote: (note: string, staffId: string) => Promise<void>;
}

const AddNoteForm = ({ staff, onAddNote }: AddNoteFormProps) => {
  const [newNote, setNewNote] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim() || !selectedStaff) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNote.trim(), selectedStaff);
      setNewNote('');
      setSelectedStaff('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-sage-700 mb-1">Select Staff Member</label>
        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
          <SelectTrigger className="border-sage-200 focus:border-emerald-300">
            <SelectValue placeholder="Choose who is adding this note" />
          </SelectTrigger>
          <SelectContent>
            {staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} - {member.designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Textarea
          placeholder="Add a note for the team..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 border-sage-200 focus:border-emerald-300 min-h-[60px]"
          rows={2}
        />
        <Button
          onClick={handleSubmit}
          disabled={!newNote.trim() || !selectedStaff || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white self-end sm:self-start h-fit"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AddNoteForm;
