import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { loginBodySchema, registerBodySchema } from "./auth.validator";

export function authRouter() {
  const router = Router();

  const repo = new AuthRepository();
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  router.post("/register", validateBody(registerBodySchema), controller.register);
  router.post("/login", validateBody(loginBodySchema), controller.login);
  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);
  router.get("/me", requireAuth, controller.me);

  return router;
}
