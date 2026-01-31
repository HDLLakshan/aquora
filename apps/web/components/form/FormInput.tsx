import { cn } from "../../lib/utils";
import { Input, type InputProps } from "../ui/input";
import { Label } from "../ui/label";

interface FormInputProps extends InputProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export function FormInput({ id, label, error, hint, className, ...props }: FormInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = error ? errorId : hintId;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(error ? "border-rose-300 focus-visible:ring-rose-200" : "", className)}
        {...props}
      />
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
