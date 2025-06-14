
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WelcomeScreen from "./components/WelcomeScreen";
import AuthScreen from "./components/AuthScreen";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [isWelcomeAuthenticated, setIsWelcomeAuthenticated] = useState(false);
  const [isSupabaseAuthenticated, setIsSupabaseAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App: Setting up auth state management');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', { event, session: !!session, userId: session?.user?.id });
        setIsSupabaseAuthenticated(!!session);
        setIsLoading(false);
      }
    );

    // Check initial session
    const checkInitialSession = async () => {
      try {
        console.log('App: Checking initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session:', { session: !!session, userId: session?.user?.id });
          setIsSupabaseAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialSession();

    // Check welcome authentication
    const welcomeAuth = localStorage.getItem('kashi-auth');
    console.log('Welcome auth status:', welcomeAuth);
    if (welcomeAuth === 'authenticated') {
      setIsWelcomeAuthenticated(true);
    }

    return () => {
      console.log('App: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleWelcomeAuthenticate = () => {
    console.log('Welcome authentication completed');
    setIsWelcomeAuthenticated(true);
    localStorage.setItem('kashi-auth', 'authenticated');
  };

  const handleSupabaseAuthenticate = () => {
    console.log('Supabase authentication completed');
    // This will be handled by the auth state change listener
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-emerald-50 flex items-center justify-center">
        <div className="text-sage-600">Loading...</div>
      </div>
    );
  }

  console.log('App render state:', { 
    isWelcomeAuthenticated, 
    isSupabaseAuthenticated, 
    isLoading 
  });

  // Show welcome screen if not welcomed yet
  if (!isWelcomeAuthenticated) {
    return <WelcomeScreen onAuthenticate={handleWelcomeAuthenticate} />;
  }

  // Show auth screen if not logged into Supabase
  if (!isSupabaseAuthenticated) {
    return <AuthScreen onAuthenticate={handleSupabaseAuthenticate} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
