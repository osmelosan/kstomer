import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "kstomer.revenueGoal";
export const DEFAULT_REVENUE_GOAL = 16000;

function readStored(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function useRevenueGoal() {
  // `custom` is the user's explicitly saved goal, if any; `goal` always
  // resolves to a display-safe number (falling back to the default).
  const [custom, setCustom] = useState<number | null>(null);

  useEffect(() => {
    setCustom(readStored());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCustom(readStored());
    };
    const onCustom = () => setCustom(readStored());
    window.addEventListener("storage", onStorage);
    window.addEventListener("kstomer:revenueGoal", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("kstomer:revenueGoal", onCustom);
    };
  }, []);

  const setGoal = useCallback((next: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
      window.dispatchEvent(new Event("kstomer:revenueGoal"));
    } catch {
      /* noop */
    }
    setCustom(next);
  }, []);

  return { goal: custom ?? DEFAULT_REVENUE_GOAL, hasCustomGoal: custom !== null, setGoal };
}
