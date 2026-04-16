import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from './routes/auth.js';
import { config } from "../config.js";

async function startServer() {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    // REST
    app.use("/auth", authRouter);

    app.listen(config.PORT ?? 3000, () =>
        console.log(`WebServer running on http://localhost:${config.PORT ?? 3000}`)
    );
}

startServer();