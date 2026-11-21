import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.js";
import webhookRouter from "./routes/webhook.js";
import applicationRouter from "./routes/applications.js";
import { config } from "../config.js";

async function startServer() {
  const app = express();

  app.use(cors());
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;

      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ` +
          `-> ${res.statusCode} (${duration}ms)`,
      );
    });

    next();
  });

  // REST
  app.use("/auth", authRouter);
  app.use("/webhook", webhookRouter);
  app.use("/applications", applicationRouter);

  const server = app.listen(config.PORT, "0.0.0.0", () => {
    console.log(
      `WebServer listening on http://0.0.0.0:${config.PORT}; health: /health`,
    );
  });
  server.on("error", (error) => {
    console.error("WebServer failed to listen:", error);
    process.exit(1);
  });
}

startServer();
