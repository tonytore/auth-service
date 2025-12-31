import { Router } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validator";
import { authMiddleware } from "@/middleware/authenticator";
import { requireInternalAuth } from "@/middleware/internal_auth";

export const authRoute = Router();

authRoute.use(requireInternalAuth);

authRoute.get("/me", authMiddleware, authController.getMe);
authRoute.post("/register", validate(registerSchema), authController.register);
authRoute.post("/login", validate(loginSchema), authController.login);
authRoute.post("/refresh", authController.refresh);
authRoute.get("/sessions", authMiddleware, authController.listSessions);
authRoute.post("/logout-current", authMiddleware, authController.logoutCurrent);
authRoute.post("/logout-all", authMiddleware, authController.logoutAll);
authRoute.post(
  "/logout/:sessionId",
  authMiddleware,
  authController.logoutBySessionId
);
