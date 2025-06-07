
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Calendar, MessageSquare } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, emoji: '🏠' },
    { id: 'minutes', label: 'Meeting Minutes', icon: MessageSquare, emoji: '✍️' },
    { id: 'social', label: 'Social Media', icon: Calendar, emoji: '📱' }
  ];

  return (
    <nav className="bg-white border-b border-sage-200 px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`
                px-4 py-2 font-medium transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-sage-700 hover:text-emerald-600 hover:bg-emerald-50'
                }
              `}
            >
              <span className="mr-2">{item.emoji}</span>
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
