"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginSchema, PasswordSchema } from "@aquora/shared";

import { FormInput } from "../../../components/form/FormInput";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const MobileInputSchema = z
  .string()
  .trim()
  .refine((value) => /^0\d{9}$/.test(value) || /^94\d{9}$/.test(value), {
    message: "Use 0767804166 format."
  })
  .transform((value) => (value.startsWith("0") ? `94${value.slice(1)}` : value));

const LoginFormSchema = LoginSchema.extend({
  mobileNumber: MobileInputSchema,
  password: PasswordSchema
});

type LoginFormValues = z.input<typeof LoginFormSchema>;
type LoginPayload = z.output<typeof LoginFormSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      mobileNumber: "",
      password: ""
    },
    mode: "onTouched"
  });

  const onSubmit = async (data: LoginPayload) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("Login payload", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormInput
        id="mobileNumber"
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="0767804166"
        hint="We will convert to +94 format for billing notifications."
        error={errors.mobileNumber?.message}
        {...register("mobileNumber")}
      />

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`pr-12 ${
              errors.password ? "border-rose-300 focus-visible:ring-rose-200" : ""
            }`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-600 transition hover:text-sky-700"
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-rose-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {errors.root && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errors.root.message}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
