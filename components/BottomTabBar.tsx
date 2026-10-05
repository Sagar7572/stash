"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5.25 9v10.5h13.5V9" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: "/library",
    label: "Library",
    icon: (
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 16.5v-11Zm16 0A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
] as const;

const rightTabs = [
  {
    href: "/search",
    label: "Search",
    icon: (
      <path d="m20 20-4.05-4.05M17.5 11a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5a7.5 7.5 0 0 1 15 0" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
] as const;

function TabLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
        active ? "text-primary" : "text-ink-muted"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} className="h-6 w-6">
        {icon}
      </svg>
      {label}
    </Link>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-tint bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-end justify-around px-4">
        {tabs.map((tab) => (
          <TabLink key={tab.href} {...tab} active={pathname === tab.href} />
        ))}

        <Link
          href="/add"
          aria-label="Add item"
          className="-mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-colors hover:bg-primary-dark"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-7 w-7">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </Link>

        {rightTabs.map((tab) => (
          <TabLink key={tab.href} {...tab} active={pathname === tab.href} />
        ))}
      </div>
    </nav>
  );
}