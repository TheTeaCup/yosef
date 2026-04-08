import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { config } from "../config.js";

const ROLE_ID = "appalcart-updates"; // replace with your actual role ID

const APPALCART_UPDATES =
  "https://appalcart.etaspot.net/service.php?service=get_service_announcements&token=appstate";
const webhook = new WebhookClient({
  url: config.DISCORD_APPALCART_WEBHOOK,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point to src/data/appalcartMessages.json relative to this file
const STORAGE_PATH = path.join(__dirname, "../data/appalcartMessages.json");

// Make sure the folder exists
const dataDir = path.dirname(STORAGE_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

type StoredMessage = {
  id: string;
  hash: string;
  end: number;
};

function hashAnnouncement(text: string, start: string) {
  return crypto
    .createHash("sha256")
    .update(text + start)
    .digest("hex");
}

function loadStored(): StoredMessage[] {
  if (!fs.existsSync(STORAGE_PATH)) return [];
  return JSON.parse(fs.readFileSync(STORAGE_PATH, "utf-8"));
}

function saveStored(data: StoredMessage[]) {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2));
}

function isActive(start: string, end: string) {
  const now = Date.now();
  return now >= new Date(start).getTime() && now <= new Date(end).getTime();
}

function getColor(type: string) {
  switch (type) {
    case "high":
      return 0xff3b30; // red
    case "normal":
      return 0xffcc00; // yellow
    default:
      return 0x5865f2; // blurple
  }
}

async function fetchAppalcartUpdates() {
  try {
    const res = await fetch(APPALCART_UPDATES);
    const data = await res.json();
    return data.get_service_announcements || [];
  } catch (err) {
    console.error("Failed to fetch AppalCART updates:", err);
    return [];
  }
}

export async function runAppalcartWatcher() {
  const announcements = await fetchAppalcartUpdates();
  const stored = loadStored();

  const newStored: StoredMessage[] = [];
  const newEmbeds: EmbedBuilder[] = [];

  let shouldPing = false;

  for (const group of announcements) {
    if (group.type === "normal") continue; // only post high priority
    for (const ann of group.announcements) {
      const active = isActive(ann.start, ann.end);
      const hash = hashAnnouncement(ann.text, ann.start);

      const existing = stored.find((s) => s.hash === hash);

      if (active && !existing) {
        shouldPing = true;

        const embed = new EmbedBuilder()
          .setTitle("🚍 AppalCART Service Update")
          .setDescription(ann.text)
          .setColor(getColor(group.type))
          .addFields(
            {
              name: "Start",
              value: `<t:${Math.floor(new Date(ann.start).getTime() / 1000)}:F>`,
              inline: true,
            },
            {
              name: "End",
              value: `<t:${Math.floor(new Date(ann.end).getTime() / 1000)}:F>`,
              inline: true,
            },
          )
          .setFooter({ text: "Source: AppalCART" })
          .setTimestamp();

        newEmbeds.push(embed);

        newStored.push({
          id: "", // placeholder until sent
          hash,
          end: new Date(ann.end).getTime(),
        });
      }

      if (active && existing) {
        newStored.push(existing);
      }
    }
  }

  if (newEmbeds.length > 0) {
    const message = await webhook.send({
      content: shouldPing ? `<@&${ROLE_ID}>` : undefined,
      embeds: newEmbeds,
    });

    // assign IDs to stored entries
    newStored.forEach((entry) => {
      if (!entry.id) entry.id = message.id;
    });

    console.log(`Sent ${newEmbeds.length} new announcements`);
  }

  for (const msg of stored) {
    if (Date.now() > msg.end) {
      try {
        await webhook.deleteMessage(msg.id);
        console.log("Deleted expired message");
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  }

  saveStored(newStored);
}

runAppalcartWatcher();
