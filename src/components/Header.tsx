
import React from 'react';
import { Calendar, Users, Leaf } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-emerald-50 to-sage-50 border-b border-sage-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-sage-800">Kashi Wellness Retreat</h1>
            <p className="text-sm text-sage-600">Marketing Minutes & Social Boost Planner</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sage-600">
            <Users className="h-4 w-4" />
            <span className="text-sm">Team Workspace</span>
          </div>
          <div className="flex items-center space-x-2 text-sage-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
