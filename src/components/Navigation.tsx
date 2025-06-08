
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: '🏠 Dashboard', description: 'Overview & metrics' },
    { id: 'minutes', label: '📝 Meeting Minutes', description: 'Record discussions' },
    { id: 'social', label: '📱 Social Media', description: 'Plan content' },
    { id: 'staff', label: '👥 Staff Management', description: 'Manage team' },
  ];

  return (
    <nav className="bg-white border-b border-sage-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => onTabChange(tab.id)}
              className={`min-w-fit px-4 py-3 flex-col h-auto ${
                activeTab === tab.id
                  ? 'bg-sage-100 text-sage-800 border-sage-300'
                  : 'text-sage-600 hover:text-sage-800 hover:bg-sage-50'
              }`}
            >
              <span className="font-medium">{tab.label}</span>
              <span className="text-xs opacity-75 mt-1">{tab.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
