
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-sage-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-6 text-center">
        <p className="text-sage-600 flex items-center justify-center space-x-1">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500 fill-current" />
          <span>by</span>
          <span className="text-emerald-600 font-medium">Dr. Aharshana Niriella</span>
          <span>to streamline marketing efforts of Kashi Wellness Retreat</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
