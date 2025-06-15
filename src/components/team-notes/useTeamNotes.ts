
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  text: string;
  created_at: string;
  author: string;
  item_id: string;
  item_type: string;
}

interface Staff {
  id: string;
  name: string;
  department: string;
  designation: string;
}

export const useTeamNotes = (itemId: string, itemType: 'action' | 'social_post') => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        title: "Error",
        description: "Failed to load staff members.",
        variant: "destructive"
      });
    }
  };

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('team_notes')
        .select('*')
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (noteText: string, staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) {
      toast({
        title: "Error",
        description: "Staff member not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_notes')
        .insert({
          text: noteText,
          author: staffMember.name,
          item_id: itemId,
          item_type: itemType
        });

      if (error) throw error;

      toast({
        title: "Note Added",
        description: "Your note has been added successfully.",
      });

      // Reload notes to show the new one
      loadNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (itemId) {
      loadNotes();
    }
  }, [itemId, itemType]);

  return {
    notes,
    staff,
    isLoading,
    addNote,
    loadNotes
  };
};
