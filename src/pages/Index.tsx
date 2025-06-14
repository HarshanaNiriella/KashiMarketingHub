
import React, { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import MarketingMinutes from '@/components/MarketingMinutes';
import SocialMediaPlanner from '@/components/SocialMediaPlanner';
import StaffManagement from '@/components/StaffManagement';
import UserManagement from '@/components/UserManagement';
import DataExport from '@/components/DataExport';
import Timeline from '@/components/Timeline';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSchedulePost = () => {
    setActiveTab('social');
  };

  const handleViewTimeline = () => {
    setActiveTab('timeline');
  };

  const handleAddMeetingMinutes = () => {
    setActiveTab('minutes');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onSchedulePost={handleSchedulePost}
            onViewTimeline={handleViewTimeline}
            onAddMeetingMinutes={handleAddMeetingMinutes}
          />
        );
      case 'minutes':
        return <MarketingMinutes />;
      case 'social':
        return <SocialMediaPlanner />;
      case 'staff':
        return <StaffManagement />;
      case 'users':
        return <UserManagement />;
      case 'export':
        return <DataExport />;
      case 'timeline':
        return <Timeline />;
      default:
        return (
          <Dashboard 
            onSchedulePost={handleSchedulePost}
            onViewTimeline={handleViewTimeline}
            onAddMeetingMinutes={handleAddMeetingMinutes}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-emerald-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
      
      <footer className="bg-white border-t border-sage-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sage-600">
            🌿 Built with mindfulness for Kashi Wellness Retreat by Dr.Harshana Niriella
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
