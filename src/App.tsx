import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthView } from './components/auth/AuthView';
import { AppShell } from './components/layout/AppShell';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-mono-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 bg-mono-950 flex items-center justify-center text-mono-0 font-display font-black text-lg animate-pulse">
          IM
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-mono-600">
          Loading Workspace Architecture...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <DataProvider>
      <AppShell />
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
