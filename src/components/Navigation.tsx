
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  Clock,
  Shield,
  Download,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUserRole();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
          checkUserRole();
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole(null);
        return;
      }

      setCurrentUser(user);

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error checking user role:', roleError);
        setUserRole(null);
      } else {
        setUserRole(roleData?.role || null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUserRole(null);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'minutes', label: 'Meeting Minutes', icon: FileText },
    { id: 'social', label: 'Social Media', icon: MessageSquare },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'users', label: 'User Management', icon: Shield, adminOnly: true },
    { id: 'admin-setup', label: 'Admin Setup', icon: Settings, adminOnly: true },
    { id: 'export', label: 'Data Export', icon: Download },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  return (
    <nav className="bg-white border-b border-sage-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            // Hide admin-only items unless user is admin
            if (item.adminOnly && userRole !== 'admin') {
              return null;
            }
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-sage-600 hover:text-sage-800 hover:border-sage-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
                {item.adminOnly && (
                  <Badge className="bg-red-100 text-red-700 text-xs">Admin</Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
