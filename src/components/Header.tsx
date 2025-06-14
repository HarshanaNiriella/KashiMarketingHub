import React from 'react';
import { Calendar, Users } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-emerald-50 to-sage-50 border-b border-sage-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center flex-shrink-0">
            <img 
              src="/lovable-uploads/2fac8819-0300-4101-8911-ccf407dc273b.png" 
              alt="Kashi Wellness Retreat" 
              className="h-10 sm:h-12 w-auto"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold text-sage-800 truncate">Kashi Wellness Retreat</h1>
            <p className="text-xs sm:text-sm text-sage-600 hidden sm:block">marketing and Social media planner</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <div className="hidden sm:flex items-center space-x-2 text-sage-600">
            <Users className="h-4 w-4" />
            <span className="text-sm">Team Workspace</span>
          </div>
          <div className="flex items-center space-x-2 text-sage-600">
            <Calendar className="h-4 w-4" />
            <span className="text-xs sm:text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
