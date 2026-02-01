"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginSchema, PasswordSchema } from "@aquora/shared";

import { FormInput } from "../../../components/form/FormInput";
import { FormPassword } from "../../../components/form/FormPassword";
import { FormSubmitButton } from "../../../components/form/FormSubmitButton";

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

      <FormPassword
        id="password"
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />

      {errors.root && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errors.root.message}
        </div>
      )}

      <FormSubmitButton
        isSubmitting={isSubmitting}
        label="Sign in"
        loadingLabel="Signing in"
      />
    </form>
  );
}
