"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { mergeLocalToSupabase } from "@/lib/storage";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  merging: boolean;
  signOut: () => Promise<void>;
  mergeLocalData: () => Promise<{ success: boolean; migratedCount: number; errors: string[] }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom event for merge completion
const MERGE_COMPLETE_EVENT = "stash:merge-complete";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
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
          setMerging(true);
          mergeLocalToSupabase().then(result => {
            console.log("[auth] Merge result:", result);
            if (!cancelled) {
              setMerging(false);
              // Notify all listeners that merge is complete
              window.dispatchEvent(new CustomEvent(MERGE_COMPLETE_EVENT, { detail: result }));
            }
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
    setMerging(true);
    try {
      const result = await mergeLocalToSupabase();
      window.dispatchEvent(new CustomEvent(MERGE_COMPLETE_EVENT, { detail: result }));
      return result;
    } finally {
      setMerging(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, merging, signOut, mergeLocalData }}>
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

// Hook for components that need to refresh after merge
export function useMergeComplete() {
  const [mergeResult, setMergeResult] = useState<{ success: boolean; migratedCount: number; errors: string[] } | null>(null);

  useEffect(() => {
    function handleMergeComplete(event: CustomEvent) {
      setMergeResult(event.detail);
    }
    window.addEventListener(MERGE_COMPLETE_EVENT, handleMergeComplete as EventListener);
    return () => window.removeEventListener(MERGE_COMPLETE_EVENT, handleMergeComplete as EventListener);
  }, []);

  return mergeResult;
}