
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

import Home from './pages/Home';
import GameRoom from './pages/GameRoom';
import JoinRoom from './pages/JoinRoom';
import NotFound from './pages/NotFound';
import { SupabaseContext } from './contexts/SupabaseContext';

// Initialize Supabase client
const supabaseUrl = 'https://lydkltnhkkmrwgjjsdta.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZGtsdG5oa2ttcndnampzZHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDYwMjAsImV4cCI6MjA2NTkyMjAyMH0.qb4jQOMXD8XP9XSYn8334_IL6WIy1lq6aeaNts6IwJ0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Space Puzzle</h1>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseContext.Provider value={supabase}>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room/:roomId" element={<GameRoom />} />
              <Route path="/join" element={<JoinRoom />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </Router>
      </SupabaseContext.Provider>
    </QueryClientProvider>
  );
}

export default App;