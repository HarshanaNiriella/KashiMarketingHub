
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

interface Staff {
  id: string;
  name: string;
  department: string;
  designation: string;
}

interface TeamNotesProps {
  itemId: string;
  itemType: 'action' | 'social_post';
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const TeamNotes = ({ itemId, itemType, itemTitle, isOpen, onClose }: TeamNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staff, setStaff] = useState<Staff[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadStaff();
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen, itemId]);

  const loadStaff = () => {
    try {
      const stored = localStorage.getItem('staff');
      if (stored) {
        setStaff(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadNotes = () => {
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

  const saveNotes = (updatedNotes: Note[]) => {
    try {
      const storageKey = `notes_${itemType}_${itemId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedStaff) {
      toast({
        title: "Missing Information",
        description: "Please select a staff member and write a note.",
        variant: "destructive"
      });
      return;
    }

    const staffMember = staff.find(s => s.id === selectedStaff);
    if (!staffMember) return;

    const note: Note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      author: staffMember.name
    };

    const updatedNotes = [...notes, note];
    saveNotes(updatedNotes);
    setNewNote('');
    setSelectedStaff('');

    toast({
      title: "Note Added",
      description: "Your note has been added successfully.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Team Notes: {itemTitle.substring(0, 30)}...</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Notes List */}
          <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-3 p-3 bg-sage-50 rounded-lg">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div key={note.id} className="bg-white p-3 rounded-lg border border-sage-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <span className="font-medium text-emerald-700 text-sm">{note.author}</span>
                    <span className="text-xs text-sage-500">
                      {format(new Date(note.timestamp), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sage-700 text-sm break-words">{note.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sage-600 text-center py-4 text-sm">No notes yet. Be the first to add one!</p>
            )}
          </div>

          {/* Add Note */}
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
                onClick={handleAddNote}
                disabled={!newNote.trim() || !selectedStaff}
                className="bg-emerald-600 hover:bg-emerald-700 text-white self-end sm:self-start h-fit"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamNotes;
