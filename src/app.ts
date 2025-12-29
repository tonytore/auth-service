import express from "express";
import cookieParser from "cookie-parser";
import { authRoute } from "./modules/auth/auth.route";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoute);

app.listen(3001, () => {
  console.log("Auth Service running on port 3001");
});
