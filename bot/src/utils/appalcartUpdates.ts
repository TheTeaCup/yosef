import fs from "fs";
import path from "path";
import {
  REST,
  Routes,
  WebhookClient,
  type APIMessage,
  type APIWebhook,
} from "discord.js";
import { config } from "../config.js";
import {
  createAppalcartWatcher,
  type StoredMessage,
} from "./appalcartWatcher.js";
import { BOT_DIR, RUNTIME_DATA_DIR } from "./runtimeData.js";
import { recoverAppalcartMessages } from "./recoverAppalcartMessages.js";

const APPALCART_UPDATES =
  "https://appalcart.etaspot.net/service.php?service=get_service_announcements&token=appstate";
const webhook = new WebhookClient({ url: config.DISCORD_APPALCART_WEBHOOK });
const discordRest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);
// Keep runtime state outside src/dist so rebuilding does not reset message IDs.
const storagePath = path.join(RUNTIME_DATA_DIR, "appalcartMessages.json");
let loggedStorage = false;

function loadStored(): StoredMessage[] {
  if (!loggedStorage) {
    console.log(
      `[AppalCART] State file: ${storagePath}; exists: ${fs.existsSync(storagePath)}`,
    );
    loggedStorage = true;
  }
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
  async recoverStored() {
    console.warn(
      "[AppalCART] No saved IDs; recovering existing notices from Discord before posting.",
    );
    const metadata = (await discordRest.get(
      Routes.webhook(webhook.id, webhook.token),
      {
        auth: false,
      },
    )) as APIWebhook;
    if (!metadata.channel_id)
      throw new Error("AppalCART webhook has no channel");
    const recovered = await recoverAppalcartMessages(
      webhook.id,
      async (before) => {
        const query = new URLSearchParams({ limit: "100" });
        if (before) query.set("before", before);
        return (await discordRest.get(
          Routes.channelMessages(metadata.channel_id!),
          { query },
        )) as APIMessage[];
      },
    );
    console.log(
      `[AppalCART] Recovered ${recovered.length} announcement records from Discord.`,
    );
    return recovered;
  },
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
