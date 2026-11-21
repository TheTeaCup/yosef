import fs from "fs";
import path from "path";
import { WebhookClient } from "discord.js";
import { config } from "../config.js";
import {
  createAppalcartWatcher,
  type StoredMessage,
} from "./appalcartWatcher.js";
import { BOT_DIR, RUNTIME_DATA_DIR } from "./runtimeData.js";

const APPALCART_UPDATES =
  "https://appalcart.etaspot.net/service.php?service=get_service_announcements&token=appstate";
const webhook = new WebhookClient({ url: config.DISCORD_APPALCART_WEBHOOK });
// Keep runtime state outside src/dist so rebuilding does not reset message IDs.
const storagePath = path.join(RUNTIME_DATA_DIR, "appalcartMessages.json");

function loadStored(): StoredMessage[] {
  if (fs.existsSync(storagePath)) {
    return JSON.parse(fs.readFileSync(storagePath, "utf8"));
  }
  // Migrate state from either the TypeScript or compiled watcher.
  const legacyPaths = ["src", "dist"].map((dir) =>
    path.join(BOT_DIR, dir, "data/appalcartMessages.json"),
  );
  const entries: StoredMessage[] = legacyPaths.flatMap((legacyPath) =>
    fs.existsSync(legacyPath)
      ? JSON.parse(fs.readFileSync(legacyPath, "utf8"))
      : [],
  );
  return entries.filter(
    (entry, index) =>
      entries.findIndex(
        (other) => other.id === entry.id && other.hash === entry.hash,
      ) === index,
  );
}

function saveStored(entries: StoredMessage[]) {
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  const temporaryPath = `${storagePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(entries, null, 2));
  fs.renameSync(temporaryPath, storagePath);
}

export const runAppalcartWatcher = createAppalcartWatcher({
  webhook,
  loadStored,
  saveStored,
  async fetchAnnouncements() {
    const response = await fetch(APPALCART_UPDATES, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw new Error(`AppalCART returned HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.get_service_announcements)) {
      throw new Error("Invalid AppalCART announcement response");
    }
    return data.get_service_announcements;
  },
});
