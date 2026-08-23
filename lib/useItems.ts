"use client";

import { useSyncExternalStore } from "react";
import { getItemsSnapshot, subscribeItems } from "@/lib/data";

export function useItems() {
  return useSyncExternalStore(subscribeItems, getItemsSnapshot, getItemsSnapshot);
}
