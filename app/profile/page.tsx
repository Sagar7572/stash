import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const meta = (user?.user_metadata ?? {}) as Record<string, string>;
  const name = meta.full_name || meta.name || "Stash user";
  const email = user?.email ?? meta.email ?? "";
  const avatarUrl = meta.avatar_url || meta.picture;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
