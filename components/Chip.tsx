"use client";

export default function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-tint-soft text-ink-secondary hover:bg-tint"
      }`}
    >
      {label}
    </button>
  );
}
