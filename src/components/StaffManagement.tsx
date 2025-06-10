import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDataSync } from '@/utils/dataSync';

interface Staff {
  id: string;
  name: string;
  department: string;
  designation: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    department: '',
    designation: ''
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
  const [editStaff, setEditStaff] = useState({
    name: '',
    department: '',
    designation: ''
  });
  const [editPassword, setEditPassword] = useState('');
  const { toast } = useToast();

  // Use data sync hook
  const { syncData } = useDataSync();

  useEffect(() => {
    loadStaff();
  }, []);

  // Listen for data refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('StaffManagement received data refresh event');
      loadStaff();
    };

    window.addEventListener('dataRefresh', handleDataRefresh);
    
    return () => {
      window.removeEventListener('dataRefresh', handleDataRefresh);
    };
  }, []);

  const loadStaff = () => {
    try {
      const stored = localStorage.getItem('staff');
      if (stored) {
        const staffData = JSON.parse(stored);
        setStaff(staffData);
        console.log('Loaded staff members:', staffData.length);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const saveStaff = (staffList: Staff[]) => {
    try {
      localStorage.setItem('staff', JSON.stringify(staffList));
      setStaff(staffList);
      // Trigger data sync after saving
      syncData();
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'staff',
        newValue: JSON.stringify(staffList),
        storageArea: localStorage
      }));
      console.log('Saved staff members:', staffList.length);
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleAddStaff = () => {
    if (password !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    if (!newStaff.name || !newStaff.department || !newStaff.designation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const staffMember: Staff = {
      id: Date.now().toString(),
      ...newStaff
    };

    const updatedStaff = [...staff, staffMember];
    saveStaff(updatedStaff);

    toast({
      title: "Success",
      description: "Staff member added successfully.",
    });

    setShowAddDialog(false);
    setPassword('');
    setNewStaff({ name: '', department: '', designation: '' });
  };

  const handleEditRequest = (staffMember: Staff) => {
    setStaffToEdit(staffMember);
    setEditStaff({
      name: staffMember.name,
      department: staffMember.department,
      designation: staffMember.designation
    });
    setShowEditDialog(true);
    setEditPassword('');
  };

  const handleEditStaff = () => {
    if (editPassword !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    if (!editStaff.name || !editStaff.department || !editStaff.designation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    if (!staffToEdit) return;

    const updatedStaff = staff.map(s => 
      s.id === staffToEdit.id 
        ? { ...s, ...editStaff }
        : s
    );

    saveStaff(updatedStaff);

    toast({
      title: "Success",
      description: "Staff member updated successfully.",
    });

    setShowEditDialog(false);
    setStaffToEdit(null);
    setEditPassword('');
    setEditStaff({ name: '', department: '', designation: '' });
  };

  const handleDeleteRequest = (staffId: string) => {
    setStaffToDelete(staffId);
    setShowDeleteDialog(true);
    setPassword('');
  };

  const handleDelete = () => {
    if (password !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    if (staffToDelete) {
      const updatedStaff = staff.filter(s => s.id !== staffToDelete);
      saveStaff(updatedStaff);
      toast({
        title: "Success",
        description: "Staff member removed successfully.",
      });
    }

    setShowDeleteDialog(false);
    setStaffToDelete(null);
    setPassword('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-sage-800">👥 Staff Management</h2>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Staff Member
        </Button>
      </div>

      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">Current Staff</h3>
        
        <div className="space-y-4">
          {staff.length > 0 ? (
            staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-100">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-sage-600" />
                  <div>
                    <p className="font-medium text-sage-800">{member.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {member.department}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {member.designation}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRequest(member)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRequest(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sage-600 text-center py-8">No staff members added yet</p>
          )}
        </div>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Name</label>
              <Input
                placeholder="Enter staff name"
                value={newStaff.name}
                onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Department</label>
              <Input
                placeholder="Enter department"
                value={newStaff.department}
                onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Designation</label>
              <Input
                placeholder="Enter designation"
                value={newStaff.designation}
                onChange={(e) => setNewStaff(prev => ({ ...prev, designation: e.target.value }))}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Admin Password</label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-sage-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStaff}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Add Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Name</label>
              <Input
                placeholder="Enter staff name"
                value={editStaff.name}
                onChange={(e) => setEditStaff(prev => ({ ...prev, name: e.target.value }))}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Department</label>
              <Input
                placeholder="Enter department"
                value={editStaff.department}
                onChange={(e) => setEditStaff(prev => ({ ...prev, department: e.target.value }))}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Designation</label>
              <Input
                placeholder="Enter designation"
                value={editStaff.designation}
                onChange={(e) => setEditStaff(prev => ({ ...prev, designation: e.target.value }))}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Admin Password</label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-sage-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditStaff}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Update Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sage-600">Enter admin password to delete this staff member:</p>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
    </div>
  );
};

export default StaffManagement;
