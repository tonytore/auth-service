import { Router } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validator";
import { authMiddleware } from "@/middleware/authenticator";

export const authRoute = Router();

authRoute.get("/me", authMiddleware, authController.listAllUsers);
authRoute.post("/register", validate(registerSchema), authController.register);
authRoute.post("/login", validate(loginSchema), authController.login);
authRoute.post("/refresh", authController.refresh);
