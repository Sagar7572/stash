export type ItemType = "article" | "pdf" | "note";
export type Status = "to-read" | "reading" | "done";

export interface Item {
  id: string;
  title: string;
  source: string;
  url: string;
  type: ItemType;
  subject: string;
  tags: string[];
  status: Status;
  summary: string;
  notes: string;
}

export const STATUS_LABELS: Record<Status, string> = {
  "to-read": "To read",
  reading: "Reading",
  done: "Done",
};

export const SUBJECTS = ["All", "DBMS", "Strategy", "Marketing"];

const seedItems: Item[] = [
  {
    id: "1",
    title: "Normalization in DBMS Explained with Examples",
    source: "geeksforgeeks.org",
    url: "https://www.geeksforgeeks.org/normalization-in-dbms/",
    type: "article",
    subject: "DBMS",
    tags: ["normalization", "exam-prep"],
    status: "reading",
    summary:
      "Covers 1NF, 2NF, 3NF and BCNF with step-by-step decomposition examples. Good diagrams comparing before/after table splits.",
    notes:
      "Revisit the BCNF example in section 4 — I keep mixing up 3NF vs BCNF when there's a transitive dependency on a candidate key.",
  },
  {
    id: "2",
    title: "Porter's Five Forces: A Practical Guide",
    source: "hbr.org",
    url: "https://hbr.org/2008/01/the-five-competitive-forces-that-shape-strategy",
    type: "article",
    subject: "Strategy",
    tags: ["frameworks", "case-study"],
    status: "reading",
    summary:
      "How to apply the five forces framework to real industries, with a walkthrough on the airline market and threat of substitutes.",
    notes: "",
  },
  {
    id: "3",
    title: "Database Systems lecture slides — Week 6 (Indexing)",
    source: "course-drive.pdf",
    url: "https://example.com/dbms-week6-indexing.pdf",
    type: "pdf",
    subject: "DBMS",
    tags: ["indexing", "b-trees"],
    status: "to-read",
    summary:
      "B-tree and B+ tree structure, clustered vs non-clustered indexing, and cost analysis of index scans.",
    notes: "",
  },
  {
    id: "4",
    title: "The 4 Ps of Marketing Aren't Dead — Here's How to Use Them",
    source: "hubspot.com",
    url: "https://blog.hubspot.com/marketing/4-ps-of-marketing",
    type: "article",
    subject: "Marketing",
    tags: ["4ps", "fundamentals"],
    status: "done",
    summary:
      "Modern take on product, price, place and promotion with SaaS and DTC brand examples for each P.",
    notes:
      "Loved the DTC pricing example. Could reuse the 'place' section for the group assignment on distribution channels.",
  },
  {
    id: "5",
    title: "SWOT Analysis Template & Filled Example — Zara",
    source: "my-notes",
    url: "https://example.com/swot-zara-notes",
    type: "note",
    subject: "Strategy",
    tags: ["swot", "case-study"],
    status: "done",
    summary:
      "My own notes from class discussion: Zara's fast-fashion SWOT with quick-turnaround supply chain as the key strength.",
    notes: "Add the H&M comparison table Prof mentioned in Thursday's class.",
  },
  {
    id: "6",
    title: "ER Diagrams: Common Mistakes Students Make",
    source: "vertabelo.com",
    url: "https://www.vertabelo.com/blog/er-diagram-common-mistakes/",
    type: "article",
    subject: "DBMS",
    tags: ["er-diagram", "exam-prep"],
    status: "to-read",
    summary:
      "Checklist-style article covering cardinality errors, weak entities, and over-complicated relationship modelling.",
    notes: "",
  },
];

let currentItems: Item[] = [...seedItems];

type Listener = () => void;

const listeners = new Set<Listener>();

function emit() {
  currentItems = [...currentItems];
  listeners.forEach((listener) => listener());
}

export function subscribeItems(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getItemsSnapshot(): Item[] {
  return currentItems;
}

export function findItem(id: string): Item | undefined {
  return currentItems.find((item) => item.id === id);
}

export function deleteItem(id: string): void {
  currentItems = currentItems.filter((item) => item.id !== id);
  emit();
}
