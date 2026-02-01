"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OfficerAssignSchema } from "@aquora/shared";
import type { OfficerAssignmentSummary, SocietyUserSummary } from "@aquora/shared";

import { assignOfficer, deactivateOfficer, getSocietyUsers } from "../../lib/api/client";
import { FormSelect } from "../../components/form/FormSelect";
import { FormSubmitButton } from "../../components/form/FormSubmitButton";
import { Button } from "../../components/ui/button";

const AssignFormSchema = OfficerAssignSchema;

type AssignFormValues = z.input<typeof AssignFormSchema>;

type Role = "PRESIDENT" | "SECRETARY";

interface OfficersPanelProps {
  societyId: string;
  societyName: string;
  initialOfficers: OfficerAssignmentSummary[];
}

function useOfficerUsers(societyId: string, role: Role, token?: string) {
  const [users, setUsers] = useState<SocietyUserSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    getSocietyUsers(token, societyId, role)
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch(() => {
        if (active) setUsers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [societyId, role, token]);

  return { users, loading };
}

function OfficerAssignCard({
  societyId,
  role,
  current,
  onUpdated
}: {
  societyId: string;
  role: Role;
  current?: OfficerAssignmentSummary | null;
  onUpdated: (officers: OfficerAssignmentSummary[]) => void;
}) {
  const { data } = useSession();
  const token = data?.accessToken;
  const { users, loading } = useOfficerUsers(societyId, role, token);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<AssignFormValues>({
    resolver: zodResolver(AssignFormSchema),
    defaultValues: {
      userId: "",
      role
    },
    mode: "onTouched"
  });

  const options = useMemo(() => {
    if (loading) {
      return [{ label: "Loading users...", value: "", disabled: true }];
    }

    return [
      { label: `Select ${role.toLowerCase().replace(/_/g, " ")}`, value: "", disabled: true },
      ...users.map((user) => ({
        label: `${user.fullName} · ${user.mobileNumber}`,
        value: user.id
      }))
    ];
  }, [loading, role, users]);

  const onSubmit = async (values: AssignFormValues) => {
    if (!token) {
      setError("root", { message: "You are not authenticated." });
      return;
    }

    try {
      const payload = AssignFormSchema.parse({
        userId: values.userId,
        role
      });
      const result = await assignOfficer(token, societyId, payload);
      onUpdated(result.officers);
    } catch {
      setError("root", { message: "Unable to assign officer." });
    }
  };

  const onDeactivate = async () => {
    if (!token || !current) return;
    try {
      const officers = await deactivateOfficer(token, societyId, current.id);
      onUpdated(officers);
    } catch {
      setError("root", { message: "Unable to deactivate officer." });
    }
  };

  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-sky-100/70">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">{role}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {current?.user.fullName ?? "Not assigned"}
          </h3>
          <p className="text-sm text-slate-500">
            {current ? current.user.mobileNumber : "Assign a leader for this role."}
          </p>
        </div>
        {current ? (
          <Button variant="outline" size="sm" onClick={onDeactivate}>
            Deactivate
          </Button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <input type="hidden" value={role} {...register("role")} />
        <FormSelect
          id={`${role.toLowerCase()}-user`}
          label="Assign user"
          options={options}
          error={errors.userId?.message}
          {...register("userId")}
        />

        {errors.root ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.root.message}
          </div>
        ) : null}

        <FormSubmitButton
          label={`Assign ${role.toLowerCase().replace(/_/g, " ")}`}
          loadingLabel="Assigning"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
}

export function OfficersPanel({ societyId, societyName, initialOfficers }: OfficersPanelProps) {
  const [officers, setOfficers] = useState(initialOfficers);

  const president = officers.find((officer) => officer.role === "PRESIDENT") ?? null;
  const secretary = officers.find((officer) => officer.role === "SECRETARY") ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-sky-600">Officers</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">Leadership team</h1>
        <p className="text-sm text-slate-500">
          Manage the president and secretary for {societyName}.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <OfficerAssignCard
          societyId={societyId}
          role="PRESIDENT"
          current={president}
          onUpdated={setOfficers}
        />
        <OfficerAssignCard
          societyId={societyId}
          role="SECRETARY"
          current={secretary}
          onUpdated={setOfficers}
        />
      </div>
    </div>
  );
}
