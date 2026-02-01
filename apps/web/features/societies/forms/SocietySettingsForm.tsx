"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SocietyCreateSchema, type SocietyDetail } from "@aquora/shared";

import { updateSociety } from "../../../lib/api/client";
import { FormInput } from "../../../components/form/FormInput";
import { FormSubmitButton } from "../../../components/form/FormSubmitButton";

const SettingsFormSchema = z.object({
  name: z.string().trim().min(1, "Society name is required."),
  address: z.string().trim().optional(),
  waterBoardRegNo: z.string().trim().min(1, "Registration number is required."),
  billingSchemeJson: z.string().trim().min(1, "Billing scheme JSON is required."),
  billingDayOfMonth: z.number().int().min(1).max(31).optional(),
  dueDays: z.number().int().min(0).optional()
});

type SettingsFormValues = z.output<typeof SettingsFormSchema>;

type SettingsPayload = z.infer<typeof SocietyCreateSchema>;

export function SocietySettingsForm({ society }: { society: SocietyDetail }) {
  const router = useRouter();
  const { data } = useSession();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      name: society.name,
      address: society.address ?? "",
      waterBoardRegNo: society.waterBoardRegNo,
      billingSchemeJson: JSON.stringify(society.billingSchemeJson ?? {}, null, 2),
      billingDayOfMonth: society.billingDayOfMonth ?? undefined,
      dueDays: society.dueDays ?? undefined
    },
    mode: "onTouched"
  });

  const onSubmit = async (values: SettingsFormValues) => {
    if (!data?.accessToken) {
      setError("root", { message: "You are not authenticated." });
      return;
    }

    let billingScheme: unknown;
    try {
      billingScheme = JSON.parse(values.billingSchemeJson);
    } catch {
      setError("billingSchemeJson", { message: "Enter valid JSON." });
      return;
    }

    let payload: SettingsPayload;
    try {
      payload = SocietyCreateSchema.parse({
        name: values.name,
        address: values.address ? values.address : undefined,
        waterBoardRegNo: values.waterBoardRegNo,
        billingSchemeJson: billingScheme,
        billingDayOfMonth: values.billingDayOfMonth,
        dueDays: values.dueDays
      });
    } catch {
      setError("root", { message: "Please review the form fields." });
      return;
    }

    try {
      await updateSociety(data.accessToken, society.id, payload);
      router.refresh();
    } catch {
      setError("root", { message: "Unable to update the society." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        id="name"
        label="Society name"
        placeholder="Lakeside Water Society"
        error={errors.name?.message}
        {...register("name")}
      />

      <FormInput
        id="waterBoardRegNo"
        label="Water board registration"
        placeholder="WB-2026-098"
        error={errors.waterBoardRegNo?.message}
        {...register("waterBoardRegNo")}
      />

      <FormInput
        id="address"
        label="Address"
        placeholder="Main Road, Colombo"
        error={errors.address?.message}
        {...register("address")}
      />

      <div className="space-y-2">
        <label htmlFor="billingSchemeJson" className="text-sm font-semibold text-slate-700">
          Billing scheme JSON
        </label>
        <textarea
          id="billingSchemeJson"
          rows={6}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm shadow-sky-100/60 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/80"
          {...register("billingSchemeJson")}
        />
        {errors.billingSchemeJson ? (
          <p className="text-sm text-rose-600">{errors.billingSchemeJson.message}</p>
        ) : (
          <p className="text-xs text-slate-500">Use JSON to define billing rules.</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput
        id="billingDayOfMonth"
        label="Billing day"
        type="number"
        min={1}
        max={31}
        placeholder="15"
        error={errors.billingDayOfMonth?.message}
        {...register("billingDayOfMonth", {
          setValueAs: (value) => (value === "" ? undefined : Number(value))
        })}
      />

        <FormInput
        id="dueDays"
        label="Due days"
        type="number"
        min={0}
        placeholder="7"
        error={errors.dueDays?.message}
        {...register("dueDays", {
          setValueAs: (value) => (value === "" ? undefined : Number(value))
        })}
      />
      </div>

      {errors.root ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errors.root.message}
        </div>
      ) : null}

      <FormSubmitButton label="Save changes" loadingLabel="Saving" isSubmitting={isSubmitting} />
    </form>
  );
}
