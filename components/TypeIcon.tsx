import type { ItemType } from "@/lib/data";

const config: Record<ItemType, { label: string; icon: React.ReactNode }> = {
  article: {
    label: "Article",
    icon: (
      <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  pdf: {
    label: "PDF",
    icon: (
      <path d="M7 3h7l4 4v14H7zM14 3v4h4M9.5 13h1a1.25 1.25 0 0 1 0 2.5h-1V13Zm0 2.5V17m3.5-4v4m0-4h.75a1.75 1.75 0 0 1 0 3.5H13" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  note: {
    label: "Note",
    icon: (
      <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10l-5 5H5a1 1 0 0 1-1-1V5Zm11 15v-4a1 1 0 0 1 1-1h4M8 9h8M8 13h5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
};

export default function TypeIcon({ type }: { type: ItemType }) {
  const { label, icon } = config[type];
  return (
    <span
      aria-label={label}
      title={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-primary"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
        {icon}
      </svg>
    </span>
  );
}
