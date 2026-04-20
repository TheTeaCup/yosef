import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";

const router = Router();

let webhookTypes = ["server", "event", "appalcart"];
const DISCORD_WEBHOOKS: Record<string, string> = {
  server: config.DISCORD_SERVER_WEBHOOK!,
  event: config.DISCORD_EVENTS_WEBHOOK!,
  appalcart: config.DISCORD_APPALCART_WEBHOOK!,
};

function hexToInt(hex: string) {
  return parseInt(hex.replace("#", ""), 16);
}

router.post("/", requireAuth, async (req, res) => {
  const { embed, token } = req.body;

  if (!embed || typeof embed !== "object") {
    return res.status(400).json({
      error: true,
      message: "Embed is required",
    });
  }

  const { type, content, embeds } = embed;

  if (!webhookTypes.includes(type)) {
    return res.status(400).json({
      error: true,
      message: "Invalid webhook type",
    });
  }

  if (!Array.isArray(embeds) || embeds.length === 0) {
    return res.status(400).json({
      error: true,
      message: "At least one embed is required",
    });
  }

  const errors: string[] = [];

  if (content && content.length > 2000) {
    errors.push("Content must be under 2000 characters");
  }

  embeds.forEach((e: any, i: number) => {
    if (type !== "server") {
      if (!e.url) {
        errors.push(`URL is required`);
      } else {
        try {
          new URL(e.url);
        } catch {
          errors.push(`URL is invalid`);
        }
      }
    }

    if (e.title !== undefined) {
      if (typeof e.title !== "string") {
        errors.push(`Title must be a string`);
      } else if (e.title.trim().length === 0) {
        errors.push(`Title cannot be empty`);
      } else if (e.title.length > 256) {
        errors.push(`Title must be under 256 characters`);
      }
    }

    if (e.description && e.description.length > 4096) {
      errors.push(`Description must be under 4096 characters`);
    }

    if (e.color && !/^#?[0-9A-Fa-f]{6}$/.test(e.color)) {
      errors.push(`Invalid hex color`);
    } else {
      e.color = hexToInt(e.color);
    }

    if (e.fields) {
      if (!Array.isArray(e.fields)) {
        errors.push(`Fields must be an array`);
      } else if (e.fields.length > 25) {
        errors.push(`Max 25 fields`);
      } else {
        e.fields.forEach((field: any, j: number) => {
          if (!field.name || field.name.length > 256) {
            errors.push(`Field ${j + 1}: Invalid name`);
          }
          if (!field.value || field.value.length > 1024) {
            errors.push(`Field ${j + 1}: Invalid value`);
          }
        });
      }
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: "Invalid embed",
      details: errors,
    });
  }

  let decoded: any;

  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch {
    return res.status(401).json({
      error: true,
      message: "Invalid token",
    });
  }

  if (!decoded.guildAccess) {
    return res.status(403).json({
      error: true,
      message: "You are not in the required server",
    });
  }

  const permissionMap: Record<string, string> = {
    server: "serverAnnoucements",
    event: "eventsRole",
    appalcart: "appalcartAnnoucements",
  };

  const requiredPerm = permissionMap[type];

  if (!decoded[requiredPerm]) {
    return res.status(403).json({
      error: true,
      message: "You do not have permission to send this embed",
    });
  }

  const payload = {
    content,
    embeds,
  };

  console.log("Sending to Discord:", JSON.stringify(payload, null, 2));

  const discordRes = await fetch(DISCORD_WEBHOOKS[type], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let discordData: any = null;

  try {
    discordData = await discordRes.json();
  } catch {
    discordData = null;
  }

  console.log(discordRes);

  if (!discordRes.ok) {
    return res.status(discordRes.status).json({
      error: true,
      message: discordData?.message || "Discord rejected the webhook",
      discord: discordData,
    });
  }

  if (discordRes.status === 429) {
    return res.status(429).json({
      error: true,
      message: "Rate limited by Discord",
      retryAfter: discordData?.retry_after,
    });
  }

  return res.json({
    error: false,
    message: "Webhook sent successfully",
  });
});

export default router;
