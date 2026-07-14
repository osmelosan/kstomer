import { useRef, useCallback } from "react";

// Roving-tabindex arrow-key navigation for a vertical list of focusable rows
// (table rows, list items). Home/End jump to the first/last row; ArrowUp/Down
// move focus by one. Attach `getRowProps(index)` to each row's root element.
export function useRovingRowNav(count: number) {
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  rowRefs.current.length = count;

  const focusRow = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(count - 1, index));
      rowRefs.current[clamped]?.focus();
    },
    [count],
  );

  const getRowProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        rowRefs.current[index] = el;
      },
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          focusRow(index + 1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          focusRow(index - 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          focusRow(0);
        } else if (e.key === "End") {
          e.preventDefault();
          focusRow(count - 1);
        }
      },
    }),
    [count, focusRow],
  );

  return { getRowProps };
}
