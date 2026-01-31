"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PasswordSchema, RegisterSchema } from "@aquora/shared";

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

const RegisterFormSchema = RegisterSchema.extend({
  mobileNumber: MobileInputSchema,
  password: PasswordSchema,
  acceptTerms: z
    .boolean()
    .refine((value) => value, { message: "Please accept the terms to continue." })
});

type RegisterFormValues = z.input<typeof RegisterFormSchema>;
type RegisterPayload = z.output<typeof RegisterFormSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      password: "",
      acceptTerms: false
    },
    mode: "onTouched"
  });

  const onSubmit = async (data: RegisterPayload) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("Register payload", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormInput
        id="name"
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Ayesha Perera"
        error={errors.name?.message}
        {...register("name")}
      />

      <FormInput
        id="mobileNumber"
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="0767804166"
        hint="We will convert to +94 format for usage alerts."
        error={errors.mobileNumber?.message}
        {...register("mobileNumber")}
      />

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Create password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
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

      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
            {...register("acceptTerms")}
          />
          <span>
            I agree to Aquora&apos;s billing terms, data usage policy, and SMS notifications.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-rose-600">{errors.acceptTerms.message}</p>
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
            Creating account
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
