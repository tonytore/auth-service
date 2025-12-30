import express from "express";
import cookieParser from "cookie-parser";
import { authRoute } from "./modules/auth/auth.route";
import { logger } from "./utils/logger/logger";
import appConfig from "./config/app_config";
import notFoundHandler from "./utils/error/not_found_error";
import errorHandler from "./utils/error/error_handler";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Auth Service is running");
});

app.use("/auth", authRoute);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(appConfig.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Auth Service running on port http://localhost:${PORT}`);
});
