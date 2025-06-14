
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: '🏠 Dashboard', badge: null },
    { id: 'minutes', label: '📝 Meeting Minutes', badge: null },
    { id: 'social', label: '📱 Social Media', badge: null },
    { id: 'staff', label: '👥 Staff Management', badge: null },
    { id: 'timeline', label: '📊 Timeline', badge: null },
  ];

  return (
    <nav className="bg-white border-b border-sage-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 border-b-2 flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-sage-600 hover:text-sage-800 hover:bg-sage-50'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
