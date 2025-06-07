
import React, { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import MarketingMinutes from '@/components/MarketingMinutes';
import SocialMediaPlanner from '@/components/SocialMediaPlanner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'minutes':
        return <MarketingMinutes />;
      case 'social':
        return <SocialMediaPlanner />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-emerald-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
      
      {/* Gentle Footer */}
      <footer className="bg-white border-t border-sage-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sage-600">
            🌿 Built with mindfulness for Kashi Wellness Retreat • 
            <span className="text-emerald-600 font-medium"> GTSPs in action</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
