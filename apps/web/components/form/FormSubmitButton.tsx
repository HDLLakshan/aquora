import { cn } from "../../lib/utils";
import { Button, type ButtonProps } from "../ui/button";

interface FormSubmitButtonProps extends Omit<ButtonProps, "type" | "children"> {
  isSubmitting: boolean;
  label: string;
  loadingLabel: string;
}

export function FormSubmitButton({
  isSubmitting,
  label,
  loadingLabel,
  className,
  size = "lg",
  disabled,
  ...props
}: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      size={size}
      className={cn("w-full", className)}
      disabled={disabled || isSubmitting}
      {...props}
    >
      {isSubmitting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
