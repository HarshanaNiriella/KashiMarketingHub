
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Leaf, UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthScreenProps {
  onAuthenticate: () => void;
}

const AuthScreen = ({ onAuthenticate }: AuthScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting login for:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error details:', error);
        
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive"
          });
          return;
        }
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive"
          });
          return;
        }
        
        throw error;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        onAuthenticate();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting signup for:', email);

    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: redirectUrl
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error details:', error);
        
        if (error.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "This email is already registered. Please try logging in instead.",
            variant: "destructive"
          });
          setActiveTab('login');
          return;
        }
        
        throw error;
      }

      if (data.user) {
        console.log('Signup successful for user:', data.user.id);
        
        // Check if email confirmation is required
        if (!data.session) {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account before signing in.",
          });
          
          // Switch to login tab
          setActiveTab('login');
          setPassword('');
        } else {
          // If session exists, user is automatically logged in
          toast({
            title: "Account Created!",
            description: "Welcome to Kashi Wellness Retreat!",
          });
          onAuthenticate();
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-sage-200">
          {/* Logo and Header */}
          <div className="text-center p-8 pb-4">
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

          {/* Auth Tabs */}
          <div className="p-8 pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sage-700">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="border-sage-300 focus:border-emerald-500"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sage-700">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="border-sage-300 focus:border-emerald-500"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sage-700">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="border-sage-300 focus:border-emerald-500"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sage-700">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="border-sage-300 focus:border-emerald-500"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sage-700">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 6 characters)"
                      className="border-sage-300 focus:border-emerald-500"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isLoading || !email || !password || !fullName || password.length < 6}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 text-center">
            <p className="text-xs text-sage-500">
              🌿 Built with mindfulness for Kashi Wellness Retreat by Dr.Harshana Niriella
            </p>
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <strong>Note:</strong> If signup/login isn't working, check your Supabase dashboard:
              <br />• Set Site URL to your app's URL
              <br />• Add redirect URLs 
              <br />• Consider disabling email confirmation for testing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
