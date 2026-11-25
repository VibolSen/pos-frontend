"use client";

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const FIELD_BASE =
  "w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2 text-sm outline-none transition focus:border-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:focus:border-zinc-200";

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  if (!label) {
    return <input className={`${FIELD_BASE} ${className}`} {...props} />;
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input className={`${FIELD_BASE} ${className}`} {...props} />
    </div>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  if (!label) {
    return <textarea className={`${FIELD_BASE} ${className}`} {...props} />;
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <textarea className={`${FIELD_BASE} ${className}`} {...props} />
    </div>
  );
}

export function Select({
  label,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const selectEl = (
    <select
      className={`${FIELD_BASE} dark:bg-zinc-900 ${className}`}
      {...props}
    >
      {children}
    </select>
  );

  if (!label) return selectEl;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      {selectEl}
    </div>
  );
}
