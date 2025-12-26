import { Router } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { authController } from "./auth.controllers";
import { validate } from "../../middleware/validator";

export const authRoute = Router();

authRoute.post("/register", validate(registerSchema), authController.register);
authRoute.post("/login", validate(loginSchema), authController.login);
