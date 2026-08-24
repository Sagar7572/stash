"use client";

import { createClient } from "@/lib/supabase/client";

const HEADLINE_LINE_1 = "Everything you save,";
const HEADLINE_LINE_2 = "in one place.";
const SUBTITLE = "Articles, PDFs and notes — organized and never lost again.";
const FOOTER_TEXT = "By continuing you agree to our terms.";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function ArticleIcon() {
  return (
    <svg {...iconProps} className="h-4.5 w-4.5">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg {...iconProps} className="h-4.5 w-4.5">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M10 12h1a1.5 1.5 0 0 1 0 3h-1v-3Zm0 3v2m4-5v5h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1Z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg {...iconProps} className="h-4.5 w-4.5">
      <path d="M5 4h14a1 1 0 0 1 1 1v10l-5 5H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M15 20v-4a1 1 0 0 1 1-1h4M8 9h8M8 13h5" />
    </svg>
  );
}

interface FloatingCard {
  icon: React.ReactNode;
  position: string;
  delay: string;
}

const cards: FloatingCard[] = [
  {
    icon: <ArticleIcon />,
    position: "left-[8%] top-2 -rotate-6",
    delay: "0s",
  },
  {
    icon: <PdfIcon />,
    position: "right-[10%] top-9 rotate-3",
    delay: "0.6s",
  },
  {
    icon: <NoteIcon />,
    position: "left-1/2 top-24 -translate-x-1/2 rotate-[-2deg]",
    delay: "1.2s",
  },
];

function SavedItemCard({ icon, position, delay }: FloatingCard) {
  return (
    <div
      className={`absolute ${position} w-32 rounded-xl border-[0.5px] border-[#ECEAF6] bg-white p-3 shadow-[0_10px_30px_-12px_rgba(108,99,217,0.25)] float-card`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tint text-primary">
        {icon}
      </span>
      <div className="mt-2.5 space-y-1.5">
        <div className="h-1.5 w-4/5 rounded-full bg-tint-soft" />
        <div className="h-1.5 w-3/5 rounded-full bg-tint-soft" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="relative h-44 w-full max-w-xs" aria-hidden="true">
        {cards.map((card) => (
          <SavedItemCard key={card.delay} {...card} />
        ))}
      </div>

      <h1 className="mt-6 text-2xl font-medium leading-snug tracking-tight text-ink">
        {HEADLINE_LINE_1}
        <br />
        <span className="text-primary">{HEADLINE_LINE_2}</span>
      </h1>

      <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-ink-secondary">
        {SUBTITLE}
      </p>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="mt-10 flex w-full max-w-xs items-center justify-center gap-3 rounded-[14px] border border-[#E4E1F2] bg-white py-3.5 pl-4 text-sm font-semibold text-ink shadow-[0_8px_24px_-8px_rgba(108,99,217,0.35)] transition-colors hover:bg-tint-soft"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 5.04c1.7 0 3.23.59 4.43 1.74l3.29-3.29C17.72 1.62 15.09.5 12 .5 7.53.5 3.65 3.03 1.75 6.77l3.84 2.98C6.49 7.31 8.99 5.04 12 5.04Z"
          />
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63l3.79 2.94c2.22-2.05 3.67-5.08 3.67-8.76Z"
          />
          <path
            fill="#FBBC05"
            d="M5.59 14.25A7.24 7.24 0 0 1 5.21 12c0-.78.13-1.54.38-2.25L1.75 6.77a11.98 11.98 0 0 0 0 10.46l3.84-2.98Z"
          />
          <path
            fill="#34A853"
            d="M12 23.5c3.09 0 5.68-1.02 7.58-2.77l-3.79-2.94c-1.06.71-2.41 1.17-3.79 1.17-3.01 0-5.51-2.27-6.41-4.71L1.75 17.23C3.65 20.97 7.53 23.5 12 23.5Z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-xs text-ink-muted">{FOOTER_TEXT}</p>
    </div>
  );
}
