import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../../utils/errors";
import type { SocietiesService } from "./societies.service";
import {
  assignmentIdParamSchema,
  societyIdParamSchema,
  societyUsersQuerySchema
} from "./societies.validator";

function parseParam(schema: { safeParse: (value: unknown) => { success: boolean; data?: string } }, value: unknown) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid request parameter", {
      code: "VALIDATION_ERROR"
    });
  }
  return parsed.data as string;
}

function ensureSocietyAccess(req: Request, societyId: string) {
  if (!req.auth) {
    throw new ApiError(401, "Unauthorized");
  }

  if (req.auth.effectiveRole === "SUPER_ADMIN") {
    return;
  }

  if (!req.auth.societyId || req.auth.societyId !== societyId) {
    throw new ApiError(403, "Forbidden");
  }
}

export class SocietiesController {
  constructor(private societiesService: SocietiesService) {}

  createSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw new ApiError(401, "Unauthorized");
      }
      const society = await this.societiesService.createSociety(req.body, { actorId: req.auth.userId });
      return res.status(201).json({ success: true, data: society });
    } catch (err) {
      return next(err);
    }
  };

  listSocieties = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const societies = await this.societiesService.listSocieties();
      return res.json({ success: true, data: societies });
    } catch (err) {
      return next(err);
    }
  };

  getSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const societyId = parseParam(societyIdParamSchema, req.params.societyId);
      ensureSocietyAccess(req, societyId);
      const society = await this.societiesService.getSocietyDetail(societyId);
      return res.json({ success: true, data: society });
    } catch (err) {
      return next(err);
    }
  };

  updateSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw new ApiError(401, "Unauthorized");
      }
      const societyId = parseParam(societyIdParamSchema, req.params.societyId);
      const society = await this.societiesService.updateSociety(societyId, req.body, { actorId: req.auth.userId });
      return res.json({ success: true, data: society });
    } catch (err) {
      return next(err);
    }
  };

  getOfficers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const societyId = parseParam(societyIdParamSchema, req.params.societyId);
      ensureSocietyAccess(req, societyId);
      const officers = await this.societiesService.getActiveOfficers(societyId);
      return res.json({ success: true, data: { officers } });
    } catch (err) {
      return next(err);
    }
  };

  assignOfficer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw new ApiError(401, "Unauthorized");
      }
      const societyId = parseParam(societyIdParamSchema, req.params.societyId);
      const result = await this.societiesService.assignOfficer(societyId, req.body, { actorId: req.auth.userId });
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  };

  deactivateOfficer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const societyId = parseParam(societyIdParamSchema, req.params.societyId);
      const assignmentId = parseParam(assignmentIdParamSchema, req.params.assignmentId);
      const result = await this.societiesService.deactivateOfficer(societyId, assignmentId);
      return res.json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  };

  listSocietyUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const societyId = parseParam(societyIdParamSchema, req.params.societyId);
      const parsedQuery = societyUsersQuerySchema.safeParse(req.query);
      if (!parsedQuery.success) {
        throw new ApiError(400, "Invalid request query", {
          code: "VALIDATION_ERROR",
          details: parsedQuery.error.flatten()
        });
      }
      const users = await this.societiesService.listUsers(societyId, parsedQuery.data.role);
      return res.json({ success: true, data: users });
    } catch (err) {
      return next(err);
    }
  };
}
