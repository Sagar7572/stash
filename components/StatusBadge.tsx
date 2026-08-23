import { STATUS_LABELS, type Status } from "@/lib/data";

const styles: Record<Status, string> = {
  "to-read": "bg-tint text-primary",
  reading: "bg-primary text-white",
  done: "bg-[#E4E2EC] text-[#8B87A0]",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
