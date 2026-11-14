"use client";

import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shadcn-style select built on Radix so keyboard nav, typeahead, Escape and
 * focus return work by default. The compound API is unchanged for callers.
 */
export const Select = SelectPrimitive.Root;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-full border border-border-default bg-bg-well px-4 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-3.5 w-3.5 text-text-secondary opacity-50 shrink-0 ml-2" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue(
  props: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        side={side}
        sideOffset={6}
        className={cn(
          "z-50 max-h-60 w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-2xl border border-border-default bg-bg-card p-1 shadow-lg",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="space-y-0.5">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-2 text-xs font-semibold text-text-secondary outline-none transition-colors data-[highlighted]:bg-bg-well data-[highlighted]:text-text-primary data-[state=checked]:text-text-primary",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-3.5 w-3.5 text-text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>
        <span className="truncate">{children}</span>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
