"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "stash_visitor_counted";

function formatCount(n: number): string {
  return n.toLocaleString();
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      const alreadyCounted = localStorage.getItem(STORAGE_KEY);

      try {
        if (!alreadyCounted) {
          const res = await fetch("/api/visitors/increment", { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && typeof data.count === "number") {
              localStorage.setItem(STORAGE_KEY, "1");
              setCount(data.count);
              setVisible(true);
            }
          }
        } else {
          const res = await fetch("/api/visitors");
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && typeof data.count === "number") {
              setCount(data.count);
              setVisible(true);
            }
          }
        }
      } catch {
        if (!cancelled) {
          setVisible(false);
        }
      }
    }

    loadCount();
    return () => { cancelled = true; };
  }, []);

  if (!visible || count === null) return null;

  return (
    <div
      className="w-full bg-primary text-white text-[11px] font-medium text-center py-1.5"
      style={{ backgroundColor: "#6C63D9" }}
      role="status"
      aria-live="polite"
    >
      {formatCount(count)} visitors and counting
    </div>
  );
}