"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { mergeLocalToSupabase } from "@/lib/storage";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  mergeLocalData: () => Promise<{ success: boolean; migratedCount: number; errors: string[] }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevUser, setPrevUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!cancelled) {
        setUser(user);
        setPrevUser(user);
        setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        const newUser = session?.user ?? null;
        // Detect sign-in (was null, now has user)
        if (prevUser === null && newUser !== null) {
          // User just signed in - trigger merge
          mergeLocalToSupabase().then(result => {
            console.log("[auth] Merge result:", result);
          });
        }
        setPrevUser(newUser);
        setUser(newUser);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const mergeLocalData = async () => {
    return mergeLocalToSupabase();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, mergeLocalData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}