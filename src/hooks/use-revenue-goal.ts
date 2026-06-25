import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "kstomer.revenueGoal";
export const DEFAULT_REVENUE_GOAL = 16000;

function read(): number {
  if (typeof window === "undefined") return DEFAULT_REVENUE_GOAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REVENUE_GOAL;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_REVENUE_GOAL;
  } catch {
    return DEFAULT_REVENUE_GOAL;
  }
}

export function useRevenueGoal() {
  const [goal, setGoalState] = useState<number>(DEFAULT_REVENUE_GOAL);

  useEffect(() => {
    setGoalState(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setGoalState(read());
    };
    const onCustom = () => setGoalState(read());
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
    setGoalState(next);
  }, []);

  return { goal, setGoal };
}
