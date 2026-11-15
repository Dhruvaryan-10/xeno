import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { env } from "./env.js";
import { safeEqual } from "./lib/security.js";
import { router } from "./routes.js";
import { flushStore } from "./store.js";

const app = express();

app.use(cors({ origin: env.corsOrigins }));
app.use(
  express.json({
    limit: "2mb",
    // Keep the exact bytes so the webhook signature can be verified.
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    }
  })
);

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path === "/webhooks/channel" || !env.apiKey) return next();
  if (safeEqual(req.header("x-api-key") ?? "", env.apiKey)) return next();
  res.status(401).json({ error: "Unauthorized" });
});
app.use("/api", router);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) return res.status(400).json({ error: "Invalid request", issues: error.issues });
  if (error instanceof Error && error.message.endsWith("not found")) return res.status(404).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(env.port, () => {
  console.log(`CRM API running on http://localhost:${env.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    flushStore();
    server.close(() => process.exit(0));
  });
}
