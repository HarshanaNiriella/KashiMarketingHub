
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, UserPlus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_at: string;
  assigned_by: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('viewer');
  const [adminPassword, setAdminPassword] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadUserRoles();

    // Set up real-time subscription for user roles
    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log('User roles changed:', payload);
          loadUserRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUsers = async () => {
    try {
      // First try to load from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading from profiles table:', profilesError);
        
        // If profiles table doesn't exist or is empty, check staff table as fallback
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .order('created_at', { ascending: false });

        if (staffError) {
          console.error('Error loading from staff table:', staffError);
          throw staffError;
        }

        // Convert staff data to user profile format
        const convertedUsers = staffData?.map(staff => ({
          id: staff.id,
          email: `${staff.name.toLowerCase().replace(/\s+/g, '.')}@kashiwellness.com`,
          full_name: staff.name,
          created_at: staff.created_at
        })) || [];

        setUsers(convertedUsers);
        console.log('Loaded users from staff table:', convertedUsers.length);
      } else {
        setUsers(profilesData || []);
        console.log('Loaded users from profiles table:', profilesData?.length || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users from database.",
        variant: "destructive"
      });
    }
  };

  const loadUserRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error loading user roles:', error);
        throw error;
      }

      setUserRoles(data || []);
      console.log('Loaded user roles from Supabase:', data?.length || 0);
    } catch (error) {
      console.error('Error loading user roles:', error);
      toast({
        title: "Error",
        description: "Failed to load user roles from database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async () => {
    if (adminPassword !== 'Umesha2020#@') {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    if (!newUserEmail || !newUserPassword || !newUserName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingUser(true);

      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserName
          }
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw authError;
      }

      if (authData.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: newUserEmail,
            full_name: newUserName
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw here as the user was created successfully
        }

        // Assign default role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'viewer'
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
        }

        toast({
          title: "Success",
          description: `User ${newUserName} created successfully.`,
        });

        setShowAddUserDialog(false);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserName('');
        setAdminPassword('');

        // Refresh data
        await loadUsers();
        await loadUserRoles();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const getUserRole = (userId: string): AppRole => {
    const userRole = userRoles.find(role => role.user_id === userId);
    return userRole?.role || 'viewer';
  };

  const handleAssignRole = async () => {
    if (adminPassword !== 'Umesha2020#@') {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedUser || !newRole) {
      toast({
        title: "Missing Information",
        description: "Please select a user and role.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdatingRole(true);

      // First, remove existing role for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);

      if (deleteError) {
        console.error('Error removing existing role:', deleteError);
        throw deleteError;
      }

      // Then assign new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.id,
          role: newRole
        });

      if (insertError) {
        console.error('Error assigning new role:', insertError);
        throw insertError;
      }

      toast({
        title: "Success",
        description: `Role ${newRole} assigned to ${selectedUser.email}.`,
      });

      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRole('viewer');
      setAdminPassword('');

      // Refresh data to ensure consistency
      await loadUserRoles();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(getUserRole(user.id));
    setShowRoleDialog(true);
    setAdminPassword('');
  };

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'staff': return 'bg-green-100 text-green-700';
      case 'viewer': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sage-600">Loading users from database...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-sage-800">👥 User Management</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowAddUserDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Badge className="bg-emerald-100 text-emerald-700">
            <Shield className="h-3 w-3 mr-1" />
            Admin Only
          </Badge>
        </div>
      </div>

      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">System Users & Roles</h3>
        
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user) => {
              const role = getUserRole(user.id);
              return (
                <div key={user.id} className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-100">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-sage-600" />
                    <div>
                      <p className="font-medium text-sage-800">{user.full_name || user.email}</p>
                      <p className="text-sm text-sage-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${getRoleBadgeColor(role)}`}>
                          {role.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-sage-500">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRole(user)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    disabled={isUpdatingRole}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Role
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-sage-600 text-center py-8">No users found in database</p>
          )}
        </div>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Full Name</label>
              <Input
                placeholder="Enter full name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Email</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Admin Password</label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddUserDialog(false)}
                className="border-sage-200"
                disabled={isCreatingUser}
              >
                Cancel
              </Button>
              <Button
                onClick={createUser}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isCreatingUser}
              >
                {isCreatingUser ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `Edit Role for ${selectedUser.email}` : 'Assign Role'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Role</label>
              <Select value={newRole} onValueChange={(value: AppRole) => setNewRole(value)}>
                <SelectTrigger className="border-sage-200">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="manager">Manager - Manage content & staff</SelectItem>
                  <SelectItem value="staff">Staff - Create & edit content</SelectItem>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Admin Password</label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="border-sage-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRoleDialog(false)}
                className="border-sage-200"
                disabled={isUpdatingRole}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignRole}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isUpdatingRole}
              >
                {isUpdatingRole ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
