"use client";

import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import SignOutButton from "@/components/SignOutButton";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center px-5 pt-16 pb-4 text-center">
        <div className="h-16 w-16 animate-pulse rounded-full bg-tint-soft" />
        <div className="mt-4 h-4 w-24 animate-pulse rounded bg-tint-soft" />
      </div>
    );
  }

  const meta = (user?.user_metadata ?? {}) as Record<string, string>;
  const name = meta.full_name || meta.name || "Stash user";
  const email = user?.email ?? meta.email ?? "";
  const avatarUrl = meta.avatar_url || meta.picture;
  const initials = name
    .split(" ")
    .map((part) => part?.[0] || "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!user) {
    return (
      <div className="flex flex-col items-center px-5 pt-16 pb-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tint text-xl font-bold text-primary">
          S
        </span>
        <h1 className="mt-5 text-xl font-bold text-ink">Not signed in</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Your items are saved on this device.
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          Sign in to sync across devices.
        </p>
        <button
          onClick={() => window.location.href = "/login"}
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-5 pt-16 pb-4 text-center">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tint text-xl font-bold text-primary">
          {initials || "S"}
        </span>
      )}

      <h1 className="mt-5 text-xl font-bold text-ink">{name}</h1>
      {email && <p className="mt-1 text-sm text-ink-secondary">{email}</p>}

      <div className="mt-8 rounded-xl bg-tint-soft p-6">
        <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">
          Stats, subjects and settings will live here. Coming soon.
        </p>
      </div>

      <div className="mt-10">
        <SignOutButton />
      </div>
    </div>
  );
}