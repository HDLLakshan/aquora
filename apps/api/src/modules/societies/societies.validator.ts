import {
  AssignmentIdSchema,
  OfficerAssignSchema,
  SocietyCreateSchema,
  SocietyIdSchema,
  SocietyUpdateSchema,
  SocietyUsersQuerySchema
} from "@aquora/shared";

export const societyIdParamSchema = SocietyIdSchema;
export const assignmentIdParamSchema = AssignmentIdSchema;

export const createSocietyBodySchema = SocietyCreateSchema;
export const updateSocietyBodySchema = SocietyUpdateSchema;
export const officerAssignBodySchema = OfficerAssignSchema;
export const societyUsersQuerySchema = SocietyUsersQuerySchema;
