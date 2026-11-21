import path from "node:path";
import { fileURLToPath } from "node:url";

export const BOT_DIR = fileURLToPath(new URL("../../", import.meta.url));
export const RUNTIME_DATA_DIR = path.resolve(
  process.env.BOT_DATA_DIR || path.join(BOT_DIR, "data"),
);
