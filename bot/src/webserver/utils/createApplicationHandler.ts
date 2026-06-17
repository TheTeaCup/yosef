import { Request, Response } from "express";
import { z } from "zod";
import { config } from "../../config.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username?: string;
  };
}

type AnyZodSchema = z.ZodTypeAny;

type EmbedBuilder<T> = (discordId: string, data: T) => Record<string, any>;

export function createApplicationHandler<T>(
  schema: AnyZodSchema,
  buildEmbed: EmbedBuilder<T>,
) {
  return async (req: AuthRequest, res: Response) => {
    try {
      const discordId = req.user?.id;

      if (!discordId) {
        return res.status(401).json({
          error: true,
          message: "Unauthorized",
        });
      }

      const result = schema.safeParse(req.body.form);

      if (!result.success) {
        return res.status(400).json({
          error: true,
          message: "Validation failed",
          issues: result.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        });
      }

      const application = result.data as T;

      const embed = buildEmbed(discordId, application);

      const webhookResponse = await fetch(config.DISCORD_APPLICATION_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      if (!webhookResponse.ok) {
        return res.status(500).json({
          error: true,
          message: "Failed to send application",
        });
      }

      return res.json({
        error: false,
        message: "Application submitted successfully",
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  };
}
