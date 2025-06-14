
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
    // Check initial session
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsSupabaseAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsSupabaseAuthenticated(!!session);
        setIsLoading(false);
      }
    );

    // Check welcome authentication
    const welcomeAuth = localStorage.getItem('kashi-auth');
    if (welcomeAuth === 'authenticated') {
      setIsWelcomeAuthenticated(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleWelcomeAuthenticate = () => {
    setIsWelcomeAuthenticated(true);
    localStorage.setItem('kashi-auth', 'authenticated');
  };

  const handleSupabaseAuthenticate = () => {
    // This will be handled by the auth state change listener
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-emerald-50 flex items-center justify-center">
        <div className="text-sage-600">Loading...</div>
      </div>
    );
  }

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
