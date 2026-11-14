import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface RadioGroupLineProps {
  id?: string;
  label: string;
  options: string[];
  value: string;
  onValueChange: (val: string) => void;
  customTriggerValue?: string;
  customValue?: string;
  onCustomChange?: (val: string) => void;
  customPlaceholder?: string;
  idPrefix: string;
  error?: string;
  className?: string;
}

export const RadioGroupLine: React.FC<RadioGroupLineProps> = ({
  id,
  label,
  options,
  value,
  onValueChange,
  customTriggerValue = "Lainnya",
  customValue = "",
  onCustomChange,
  customPlaceholder = "Tuliskan jawabanmu...",
  idPrefix,
  error,
  className = "",
}) => {
  const errorId = `${idPrefix}-error`;
  const customId = `${idPrefix}-custom`;

  return (
    <div id={id} className={`w-full ${className}`}>
      <span className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
        {label}
      </span>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="space-y-2"
      >
        {options.map((opt) => {
          const itemId = `${idPrefix}-${opt}`;
          return (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem
                value={opt}
                id={itemId}
                className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white focus-visible:ring-2 focus-visible:ring-[#2F5C86]/40 focus-visible:ring-offset-2"
              />
              <Label htmlFor={itemId} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                {opt}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {value === customTriggerValue && onCustomChange && (
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
