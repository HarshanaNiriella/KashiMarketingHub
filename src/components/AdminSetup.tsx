
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield } from 'lucide-react';

const AdminSetup = () => {
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { toast } = useToast();

  const createAdminUser = async () => {
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

  return (
    <Card className="p-6 border-sage-200 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <Shield className="h-12 w-12 text-emerald-600 mx-auto" />
        <h3 className="text-lg font-semibold text-sage-800">Setup Admin User</h3>
        <p className="text-sm text-sage-600">
          Create Dr. Harshana Niriella as the super admin user
        </p>
        <Button
          onClick={createAdminUser}
          disabled={isCreatingAdmin}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isCreatingAdmin ? 'Creating Admin...' : 'Create Admin User'}
        </Button>
      </div>
    </Card>
  );
};

export default AdminSetup;
