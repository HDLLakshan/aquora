import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { authRouter } from "./modules/auth/auth.routes";

const app = express();

app.set("trust proxy", env.TRUST_PROXY);
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((o: string) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes("*")) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter());

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`[api] listening on http://localhost:${env.PORT}`);
});
