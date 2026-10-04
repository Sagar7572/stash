"use client";

import { useState, ChangeEvent, KeyboardEvent } from "react";

export default function KeywordChips({
  keywords,
  onChange,
  editable = true,
}: {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  editable?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      onChange([...keywords, trimmed]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (keyword: string) => {
    onChange(keywords.filter((k) => k !== keyword));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <span
          key={kw}
          className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3 py-1 text-xs font-medium text-primary"
        >
          {kw}
          {editable && (
            <button
              type="button"
              onClick={() => handleRemove(kw)}
              className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/60 hover:bg-primary hover:text-white"
              aria-label={`Remove ${kw}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </span>
      ))}
      {editable && (
        <input
          type="text"
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAdd}
          placeholder={keywords.length === 0 ? "Add keywords…" : ""}
          className="h-7 w-auto min-w-[100px] rounded-full border border-[#E5E3F0] bg-white px-3 py-0.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}
    </div>
  );
}