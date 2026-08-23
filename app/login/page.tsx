"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-ink">
        Stash<span className="text-primary">.</span>
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-secondary">
        Save articles, PDFs and notes — and pick up right where you left off.
      </p>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="mt-10 flex w-full max-w-xs items-center justify-center gap-3 rounded-xl bg-primary py-3.5 pl-4 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 5.04c1.7 0 3.23.59 4.43 1.74l3.29-3.29C17.72 1.62 15.09.5 12 .5 7.53.5 3.65 3.03 1.75 6.77l3.84 2.98C6.49 7.31 8.99 5.04 12 5.04Z"
            />
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63l3.79 2.94c2.22-2.05 3.67-5.08 3.67-8.76Z"
            />
            <path
              fill="#FBBC05"
              d="M5.59 14.25A7.24 7.24 0 0 1 5.21 12c0-.78.13-1.54.38-2.25L1.75 6.77a11.98 11.98 0 0 0 0 10.46l3.84-2.98Z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.09 0 5.68-1.02 7.58-2.77l-3.79-2.94c-1.06.71-2.41 1.17-3.79 1.17-3.01 0-5.51-2.27-6.41-4.71L1.75 17.23C3.65 20.97 7.53 23.5 12 23.5Z"
            />
          </svg>
        </span>
        Continue with Google
      </button>

      <p className="mt-6 text-xs text-ink-muted">
        Your learning material, all in one stash.
      </p>
    </div>
  );
}
