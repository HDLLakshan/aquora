import type { SelectHTMLAttributes } from "react";

import { cn } from "../../lib/utils";
import { Label } from "../ui/label";

interface FormSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  hidden?: boolean;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: FormSelectOption[];
  error?: string | undefined;
  hint?: string | undefined;
}

export function FormSelect({
  id,
  label,
  options,
  error,
  hint,
  className,
  ...props
}: FormSelectProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = error ? errorId : hintId;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-900 shadow-sm shadow-sky-100/60 transition focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          error ? "border-rose-300 focus-visible:ring-rose-200" : "",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            hidden={option.hidden}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-sm text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
