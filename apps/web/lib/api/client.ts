import { z } from "zod";
import {
  OfficerAssignSchema,
  OfficerAssignmentSummarySchema,
  SocietyCreateSchema,
  SocietyDetailSchema,
  SocietySummarySchema,
  SocietyUpdateSchema,
  SocietyUsersQuerySchema,
  SocietyUserSummarySchema
} from "@aquora/shared";

import { getApiUrl } from "../api-client";

const SuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema
  });

const SocietiesResponseSchema = SuccessSchema(z.array(SocietySummarySchema));
const SocietyDetailResponseSchema = SuccessSchema(SocietyDetailSchema);
const SocietyUsersResponseSchema = SuccessSchema(z.array(SocietyUserSummarySchema));
const OfficersResponseSchema = SuccessSchema(
  z.object({
    officers: z.array(OfficerAssignmentSummarySchema)
  })
);
const AssignOfficerResponseSchema = SuccessSchema(
  z.object({
    assignment: OfficerAssignmentSummarySchema,
    officers: z.array(OfficerAssignmentSummarySchema)
  })
);
const UpdateSocietyResponseSchema = SuccessSchema(SocietySummarySchema);
const CreateSocietyResponseSchema = SuccessSchema(SocietySummarySchema);

async function apiFetch<T>(
  path: string,
  token: string,
  schema: z.ZodSchema<T>,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });

  const json = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("Request failed");
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid response");
  }

  return parsed.data;
}

export async function getSocieties(token: string) {
  const parsed = await apiFetch("/societies", token, SocietiesResponseSchema);
  return parsed.data;
}

export async function getSocietyById(token: string, societyId: string) {
  const parsed = await apiFetch(`/societies/${societyId}`, token, SocietyDetailResponseSchema);
  return parsed.data;
}

export async function getSocietyUsers(
  token: string,
  societyId: string,
  role?: z.infer<typeof SocietyUsersQuerySchema>["role"]
) {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  const parsed = await apiFetch(`/societies/${societyId}/users${query}`, token, SocietyUsersResponseSchema);
  return parsed.data;
}

export async function createSociety(token: string, body: z.infer<typeof SocietyCreateSchema>) {
  const parsed = await apiFetch("/societies", token, CreateSocietyResponseSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return parsed.data;
}

export async function updateSociety(
  token: string,
  societyId: string,
  body: z.infer<typeof SocietyUpdateSchema>
) {
  const parsed = await apiFetch(`/societies/${societyId}`, token, UpdateSocietyResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
  return parsed.data;
}

export async function getOfficers(token: string, societyId: string) {
  const parsed = await apiFetch(`/societies/${societyId}/officers`, token, OfficersResponseSchema);
  return parsed.data.officers;
}

export async function assignOfficer(token: string, societyId: string, body: z.infer<typeof OfficerAssignSchema>) {
  const parsed = await apiFetch(`/societies/${societyId}/officers/assign`, token, AssignOfficerResponseSchema, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return parsed.data;
}

export async function deactivateOfficer(token: string, societyId: string, assignmentId: string) {
  const parsed = await apiFetch(
    `/societies/${societyId}/officers/${assignmentId}/deactivate`,
    token,
    OfficersResponseSchema,
    {
      method: "PATCH"
    }
  );
  return parsed.data.officers;
}
