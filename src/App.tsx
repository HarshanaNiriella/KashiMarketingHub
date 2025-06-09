
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import MarketingMinutes from '@/components/MarketingMinutes';
import SocialMediaPlanner from '@/components/SocialMediaPlanner';
import Timeline from '@/components/Timeline';
import ScheduleSocialPost from '@/components/ScheduleSocialPost';
import StaffManagement from '@/components/StaffManagement';
import Footer from '@/components/Footer';
import { useDataSync } from '@/utils/dataSync';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState('dashboard');

  // Initialize data sync
  useDataSync();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentView(tab);
  };

  const handleSchedulePost = () => {
    setCurrentView('schedule-post');
  };

  const handleViewTimeline = () => {
    setCurrentView('timeline');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActiveTab('dashboard');
  };

  const handleAddMeetingMinutes = () => {
    setActiveTab('minutes');
    setCurrentView('minutes');
  };

  const renderContent = () => {
    switch (currentView) {
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
      case 'timeline':
        return <Timeline />;
      case 'schedule-post':
        return <ScheduleSocialPost onBack={handleBackToDashboard} />;
      case 'staff':
        return <StaffManagement />;
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
      <header className="bg-white shadow-sm border-b border-sage-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/2fac8819-0300-4101-8911-ccf407dc273b.png" 
              alt="Kashi Wellness Retreat" 
              className="h-10 sm:h-12 w-auto flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-sage-800 truncate">Kashi Wellness Marketing Hub</h1>
              <p className="text-sage-600 text-sm sm:text-base mt-1 hidden sm:block">Streamline Kashi's wellness marketing efforts</p>
            </div>
          </div>
        </div>
      </header>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {renderContent()}
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
