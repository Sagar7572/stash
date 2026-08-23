export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center px-5 pt-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tint text-xl font-bold text-primary">
        GB
      </span>
      <h1 className="mt-5 text-xl font-bold text-ink">Your profile</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-secondary">
        Stats, subjects and settings will live here. Coming soon.
      </p>
    </div>
  );
}
