"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { Item } from "../styling/engine";

const GuestWardrobeContext = createContext<{
  items: Item[];
  setItems: Dispatch<SetStateAction<Item[]>>;
} | null>(null);

export function GuestWardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  return <GuestWardrobeContext.Provider value={{ items, setItems }}>{children}</GuestWardrobeContext.Provider>;
}

export function useGuestWardrobe() {
  const context = useContext(GuestWardrobeContext);
  if (!context) throw new Error("Guest wardrobe requires its client provider.");
  return context;
}
