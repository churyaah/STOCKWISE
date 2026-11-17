import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, businessName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN_USER: UserProfile = {
  id: 'usr-admin-demo-001',
  email: 'admin@inventory.local',
  full_name: 'Alexander Sterling',
  business_name: 'Sterling Precision Systems',
  role: 'admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  useEffect(() => {
    // If Supabase is configured, attach auth listener
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Supabase is not configured yet. Check if demo session is stored or initialize demo admin
      const storedDemo = localStorage.getItem('inv_mgr_demo_auth');
      if (storedDemo === 'false') {
        setUser(null);
        setProfile(null);
        setIsDemoUser(false);
      } else {
        // By default, provide demo admin access so the app works out of the box
        setProfile(DEMO_ADMIN_USER);
        setIsDemoUser(true);
        setUser({
          id: DEMO_ADMIN_USER.id,
          email: DEMO_ADMIN_USER.email,
          app_metadata: {},
          user_metadata: { full_name: DEMO_ADMIN_USER.full_name },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User);
      }
      setLoading(false);
    }
  }, []);

  const fetchSupabaseProfile = async (userId: string, email: string) => {
    try {
      if (!supabase) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data as UserProfile);
      } else {
        setProfile({
          id: userId,
          email,
          full_name: 'Administrator',
          business_name: 'Enterprise Inventory',
          role: 'admin',
        });
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return;
    }

    // Demo authentication check
    if (email && password) {
      localStorage.setItem('inv_mgr_demo_auth', 'true');
      setProfile({
        ...DEMO_ADMIN_USER,
        email,
      });
      setIsDemoUser(true);
      setUser({
        id: DEMO_ADMIN_USER.id,
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User);
      return;
    }
    throw new Error('Please provide email and password.');
  };

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            business_name: businessName,
            role: 'admin',
          },
        ]);
      }
      return;
    }

    // Local Demo Sign Up
    localStorage.setItem('inv_mgr_demo_auth', 'true');
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      business_name: businessName,
      role: 'admin',
    };
    setProfile(newProfile);
    setIsDemoUser(true);
    setUser({
      id: newProfile.id,
      email,
      app_metadata: {},
      user_metadata: { full_name: fullName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User);
  };

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.setItem('inv_mgr_demo_auth', 'false');
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsDemoUser(false);
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return;
    }
    // Demo feedback
    await new Promise(resolve => setTimeout(resolve, 600));
  };

  const signInDemoAdmin = () => {
    localStorage.setItem('inv_mgr_demo_auth', 'true');
    setProfile(DEMO_ADMIN_USER);
    setIsDemoUser(true);
    setUser({
      id: DEMO_ADMIN_USER.id,
      email: DEMO_ADMIN_USER.email,
      app_metadata: {},
      user_metadata: { full_name: DEMO_ADMIN_USER.full_name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoUser,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
