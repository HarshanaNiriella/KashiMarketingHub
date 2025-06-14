
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock } from 'lucide-react';

const AdminSetup = () => {
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      setCurrentUser(user);

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error checking user role:', roleError);
      } else {
        setUserRole(roleData?.role || null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminUser = async () => {
    // First check if current user is admin
    if (userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only existing admin users can create new admin accounts.",
        variant: "destructive"
      });
      return;
    }

    if (adminPassword !== 'Umesha2020#@') {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingAdmin(true);
      
      // Create Dr. Harshana as admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'dr.harshana@kashiwellness.com',
        password: 'Umesha2020#@',
        options: {
          data: {
            full_name: 'Dr. Harshana Niriella'
          }
        }
      });

      if (authError) {
        console.error('Error creating admin user:', authError);
        throw authError;
      }

      if (authData.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: 'dr.harshana@kashiwellness.com',
            full_name: 'Dr. Harshana Niriella'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Assign admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'admin'
          });

        if (roleError) {
          console.error('Error assigning admin role:', roleError);
        }

        toast({
          title: "Success",
          description: "Admin user Dr. Harshana Niriella created successfully!",
        });

        setAdminPassword('');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: "Failed to create admin user. They may already exist.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sage-600">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card className="p-6 border-sage-200 max-w-md mx-auto">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-red-600 mx-auto" />
          <h3 className="text-lg font-semibold text-sage-800">Access Denied</h3>
          <p className="text-sm text-sage-600">
            You must be logged in to access admin setup.
          </p>
        </div>
      </Card>
    );
  }

  if (userRole !== 'admin') {
    return (
      <Card className="p-6 border-sage-200 max-w-md mx-auto">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-red-600 mx-auto" />
          <h3 className="text-lg font-semibold text-sage-800">Admin Access Required</h3>
          <p className="text-sm text-sage-600">
            Only existing admin users can create new admin accounts.
          </p>
          <p className="text-xs text-sage-500">
            Current role: {userRole || 'No role assigned'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-sage-200 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <Shield className="h-12 w-12 text-emerald-600 mx-auto" />
        <h3 className="text-lg font-semibold text-sage-800">Setup Admin User</h3>
        <p className="text-sm text-sage-600">
          Create Dr. Harshana Niriella as the super admin user
        </p>
        
        <div className="space-y-3">
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
          
          <Button
            onClick={createAdminUser}
            disabled={isCreatingAdmin || !adminPassword}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isCreatingAdmin ? 'Creating Admin...' : 'Create Admin User'}
          </Button>
        </div>
        
        <p className="text-xs text-sage-500">
          Logged in as: {currentUser.email}
        </p>
      </div>
    </Card>
  );
};

export default AdminSetup;
