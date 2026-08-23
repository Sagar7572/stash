export default function SearchPage() {
  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Search</h1>
      <input
        type="search"
        placeholder="Search titles, tags, sources…"
        className="mt-6 w-full rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <div className="mt-10 flex flex-col items-center rounded-xl bg-tint-soft p-8 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-ink-muted">
          <path d="m20 20-4.05-4.05M17.5 11a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" strokeLinecap="round" />
        </svg>
        <p className="mt-4 text-sm font-medium text-ink">No results yet</p>
        <p className="mt-1 text-xs text-ink-muted">Start typing to find items in your stash.</p>
      </div>
    </div>
  );
}
