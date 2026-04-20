import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.js";
import webhookRouter from "./routes/webhook.js";
import { config } from "../config.js";

async function startServer() {
  const app = express();

  app.use(cors());
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

  app.listen(config.PORT ?? 3000, () =>
    console.log(`WebServer running on http://localhost:${config.PORT ?? 3000}`),
  );
}

startServer();
