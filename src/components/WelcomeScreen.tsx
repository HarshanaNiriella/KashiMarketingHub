
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Leaf } from 'lucide-react';

interface WelcomeScreenProps {
  onAuthenticate: () => void;
}

const WelcomeScreen = ({ onAuthenticate }: WelcomeScreenProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check password
    if (password === 'kashiwellnessretreat') {
      setTimeout(() => {
        onAuthenticate();
        setIsLoading(false);
      }, 500);
    } else {
      setTimeout(() => {
        setError('Incorrect password. Please try again.');
        setPassword('');
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-sage-200">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Leaf className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-sage-800 mb-2">
              Kashi Wellness Retreat
            </h1>
            <p className="text-sage-600 text-sm">
              Marketing & Social Media Planner
            </p>
          </div>

          {/* Access Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-sage-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-sage-700 mb-2">
                Private Access Required
              </h2>
              <p className="text-sm text-sage-600">
                Please enter the access password to continue
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sage-700">
                Access Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="border-sage-300 focus:border-emerald-500 focus:ring-emerald-200"
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-sage-500">
              🌿 Built with mindfulness for internal use only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
