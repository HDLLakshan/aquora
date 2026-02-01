"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import { PasswordSchema, RegisterSchema } from "@aquora/shared";

import { FormInput } from "../../../components/form/FormInput";
import { FormPassword } from "../../../components/form/FormPassword";
import { FormSubmitButton } from "../../../components/form/FormSubmitButton";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";

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
  const {
    control,
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

  const {
    field: acceptTermsField,
    fieldState: acceptTermsState
  } = useController({
    name: "acceptTerms",
    control
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

      <FormPassword
        id="password"
        label="Create password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm">
          <Checkbox
            id="acceptTerms"
            checked={acceptTermsField.value}
            onCheckedChange={(checked) => acceptTermsField.onChange(checked === true)}
            onBlur={acceptTermsField.onBlur}
            name={acceptTermsField.name}
            aria-invalid={acceptTermsState.invalid}
            aria-describedby={acceptTermsState.error ? "acceptTerms-error" : undefined}
            ref={acceptTermsField.ref}
            className="mt-1"
          />
          <Label
            htmlFor="acceptTerms"
            className="cursor-pointer text-sm font-normal text-slate-600"
          >
            I agree to Aquora&apos;s billing terms, data usage policy, and SMS notifications.
          </Label>
        </div>
        {acceptTermsState.error && (
          <p id="acceptTerms-error" className="text-sm text-rose-600">
            {acceptTermsState.error.message}
          </p>
        )}
      </div>

      {errors.root && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errors.root.message}
        </div>
      )}

      <FormSubmitButton
        isSubmitting={isSubmitting}
        label="Create account"
        loadingLabel="Creating account"
      />
    </form>
  );
}
