import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthView } from './components/auth/AuthView';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './components/landing/LandingPage';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'showcase' | 'app'>(() => {
    // Default directly to the full operational app suite
    return localStorage.getItem('invent_preferred_view') === 'showcase' ? 'showcase' : 'app';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-ground flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 bg-ink flex items-center justify-center text-white font-display font-black text-lg animate-pulse relative">
          I
          <span className="w-1.5 h-1.5 rounded-full bg-signal absolute top-1.5 right-1.5" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
          Loading INVENT Technical Node...
        </p>
      </div>
    );
  }

  // 1. If in Showcase mode, display the high-precision landing page
  if (viewMode === 'showcase') {
    return (
      <LandingPage
        onLaunchApp={() => {
          localStorage.setItem('invent_preferred_view', 'app');
          setViewMode('app');
        }}
      />
    );
  }

  // 2. If in App mode, check user authentication
  if (!user) {
    return <AuthView />;
  }

  // 3. User is authenticated, render the full 8-screen application suite
  return (
    <DataProvider>
      <AppShell
        onOpenShowcase={() => {
          localStorage.setItem('invent_preferred_view', 'showcase');
          setViewMode('showcase');
        }}
      />
    </DataProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
