import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved";

export function useAutosave<T>(
  value: T,
  onSave: (value: T) => void | Promise<void>,
  delay = 800,
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const firstRun = useRef(true);
  const latest = useRef(onSave);
  latest.current = onSave;

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("pending");
    const timer = setTimeout(async () => {
      setStatus("saving");
      try {
        await latest.current(value);
        setSavedAt(new Date());
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return { status, savedAt };
}
