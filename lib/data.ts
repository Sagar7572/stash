export type ItemType = "article" | "pdf" | "note";
export type Status = "to-read" | "reading" | "done";

export interface Item {
  id: string;
  title: string;
  url: string;
  type: ItemType;
  subject: string;
  tags: string[];
  status: Status;
  summary: string;
  notes: string;
  keywords: string[];
  created_at: string;
}

export function displaySource(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

export const STATUS_LABELS: Record<Status, string> = {
  "to-read": "To read",
  reading: "Reading",
  done: "Done",
};