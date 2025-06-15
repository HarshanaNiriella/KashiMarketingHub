
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  Clock,
  Download,
  Settings,
  TrendingUp
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'minutes', label: 'Meeting Minutes', icon: FileText },
    { id: 'social', label: 'Social Media', icon: MessageSquare },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'sales-tracker', label: 'Sales & Staff Tracker', icon: TrendingUp },
    { id: 'admin-setup', label: 'Admin Setup', icon: Settings },
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
                {item.id === 'admin-setup' && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    Admin
                  </Badge>
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
