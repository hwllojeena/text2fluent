'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Extend user with 'name' to match previous NextAuth behavior
type ExtendedUser = User & { name: string };

type AuthContextType = {
  data: { user: ExtendedUser | null } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
};

const AuthContext = createContext<AuthContextType>({ data: null, status: 'loading' });

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          ...session.user,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
      } else {
        setUser(null);
      }
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          ...session.user,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        });
      } else {
        setUser(null);
      }
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = {
    data: session && user ? { user } : null,
    status
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useSession = () => useContext(AuthContext);

export const signOut = async ({ callbackUrl = '/' } = {}) => {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = callbackUrl;
};
