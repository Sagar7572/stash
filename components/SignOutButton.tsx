"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SignOutButton() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  return (
    <button
      type="button"
      disabled={signingOut}
      onClick={async () => {
        setSigningOut(true);
        await signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-xl border border-[#E5E3F0] px-6 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-tint-soft hover:text-primary disabled:opacity-50"
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}