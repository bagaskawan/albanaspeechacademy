import React, { useId } from "react";

export interface MultiSelectLineProps {
  id?: string;
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  maxSelect?: number;
  showRemaining?: boolean;
  customTriggerValue?: string;
  customValue?: string;
  onCustomChange?: (val: string) => void;
  customPlaceholder?: string;
  error?: string;
  className?: string;
}

export const MultiSelectLine: React.FC<MultiSelectLineProps> = ({
  id,
  label,
  options,
  selected,
  onToggle,
  maxSelect,
  showRemaining = false,
  customTriggerValue = "Lainnya",
  customValue = "",
  onCustomChange,
  customPlaceholder = "Tuliskan lainnya...",
  error,
  className = "",
}) => {
  const generatedId = useId();
  const groupId = id ?? `multiselect-${generatedId}`;
  const labelId = `${groupId}-label`;
  const errorId = `${groupId}-error`;
  const customId = `${groupId}-custom`;

  return (
    <div id={id} className={`w-full ${className}`}>
      <span
        id={labelId}
        className="text-[11px] font-bold tracking-wider text-zinc-800 dark:text-zinc-400 uppercase block mb-1"
      >
        {label}
      </span>

      {showRemaining && maxSelect !== undefined && (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-3">
          Tersisa {maxSelect - selected.length} pilihan
        </span>
      )}

      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        className="space-y-2"
      >
        {options.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(item)}
              className={`w-full text-left p-3 border text-xs transition-all outline-none rounded-none cursor-pointer flex items-center justify-between focus-visible:ring-2 focus-visible:ring-[#2F5C86]/40 focus-visible:ring-offset-2 ${isSelected
                ? "bg-[#2F5C86] dark:bg-[#D5E7FF] text-white dark:text-[#111111] border-[#2F5C86] dark:border-[#D5E7FF] font-semibold"
                : "bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#2F5C86] dark:hover:border-[#D5E7FF]"
                }`}
            >
              <span>{item}</span>
              {isSelected && <span className="font-mono text-[10px] uppercase">[✓]</span>}
            </button>
          );
        })}
      </div>

      {selected.includes(customTriggerValue) && onCustomChange && (
        <input
          id={customId}
          type="text"
          placeholder={customPlaceholder}
          aria-label={customPlaceholder}
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#2F5C86] dark:focus:border-[#D5E7FF] focus-visible:ring-2 focus-visible:ring-[#2F5C86]/40 focus-visible:ring-offset-2"
        />
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive font-semibold animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
