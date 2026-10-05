"use client";

import { useState } from "react";

export default function SubjectCombobox({
  name,
  options,
  placeholder = "Type or pick a subject",
  defaultValue = "",
}: {
  name: string;
  options: string[];
  placeholder?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const query = value.trim().toLowerCase();
  const filtered = options.filter(
    (option) => option.toLowerCase() !== query && option.toLowerCase().includes(query)
  );

  return (
    <div className="relative">
      <input
        name={name}
        type="text"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="w-full rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {open && (
        <ul className="absolute z-30 mt-1.5 max-h-48 w-full overflow-y-auto rounded-xl border border-[#E5E3F0] bg-white py-1 shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setValue(option);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-tint hover:text-primary"
                >
                  {option}
                </button>
              </li>
            ))
          ) : (
            <li
              aria-hidden="true"
              className="px-4 py-2.5 text-xs text-ink-muted"
            >
              {query ? `Will save as new subject: “${value.trim()}”` : "Type to add a subject"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
