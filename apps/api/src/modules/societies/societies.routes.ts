import { Router } from "express";

import { requireAuth, requireSuperAdmin } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { SocietiesController } from "./societies.controller";
import { SocietiesRepository } from "./societies.repository";
import { SocietiesService } from "./societies.service";
import { createSocietyBodySchema, officerAssignBodySchema, updateSocietyBodySchema } from "./societies.validator";

export function societiesRouter() {
  const router = Router();

  const repo = new SocietiesRepository();
  const service = new SocietiesService(repo);
  const controller = new SocietiesController(service);

  router.post("/societies", requireAuth, requireSuperAdmin, validateBody(createSocietyBodySchema), controller.createSociety);
  router.get("/societies", requireAuth, requireSuperAdmin, controller.listSocieties);
  router.get("/societies/:societyId", requireAuth, controller.getSociety);
  router.patch("/societies/:societyId", requireAuth, requireSuperAdmin, validateBody(updateSocietyBodySchema), controller.updateSociety);

  router.get("/societies/:societyId/officers", requireAuth, controller.getOfficers);
  router.post(
    "/societies/:societyId/officers/assign",
    requireAuth,
    requireSuperAdmin,
    validateBody(officerAssignBodySchema),
    controller.assignOfficer
  );
  router.patch(
    "/societies/:societyId/officers/:assignmentId/deactivate",
    requireAuth,
    requireSuperAdmin,
    controller.deactivateOfficer
  );

  router.get("/societies/:societyId/users", requireAuth, requireSuperAdmin, controller.listSocietyUsers);

  return router;
}
