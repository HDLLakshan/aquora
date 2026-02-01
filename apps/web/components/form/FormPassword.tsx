"use client";

import { useState } from "react";

import { cn } from "../../lib/utils";
import { Input, type InputProps } from "../ui/input";
import { Label } from "../ui/label";

interface FormPasswordProps extends Omit<InputProps, "type"> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export function FormPassword({ id, label, error, hint, className, ...props }: FormPasswordProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = error ? errorId : hintId;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "pr-12",
            error ? "border-rose-300 focus-visible:ring-rose-200" : "",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-600 transition hover:text-sky-700"
          aria-pressed={isVisible}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
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
