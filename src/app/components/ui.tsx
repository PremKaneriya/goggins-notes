"use client";
import React, { forwardRef } from "react";
import { Search, X } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center sm:py-20">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-surface-2 text-ink-2">{icon}</div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-2">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Keyboard shortcut shown on desktop while the field is empty */
  shortcutHint?: string;
  className?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { value, onChange, placeholder, shortcutHint, className = "" },
  ref
) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          if (value) onChange("");
          else e.currentTarget.blur();
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input h-11 pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          onClick={(e) => {
            onChange("");
            e.currentTarget.parentElement?.querySelector("input")?.focus();
          }}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : (
        shortcutHint && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-ink-3 md:block">
            {shortcutHint}
          </kbd>
        )
      )}
    </div>
  );
});
