import type { APIEmbed } from "discord.js";
import {
  announcementIdentity,
  type StoredMessage,
} from "./appalcartWatcher.js";

type HistoryMessage = { id: string; webhook_id?: string; embeds: APIEmbed[] };

export async function recoverAppalcartMessages(
  webhookId: string,
  fetchPage: (before?: string) => Promise<HistoryMessage[]>,
): Promise<StoredMessage[]> {
  const recovered: StoredMessage[] = [];
  let before: string | undefined;
  // Walk the channel history rather than assuming the notice is in the latest
  // page. A failure aborts recovery so an outage cannot cause a duplicate send.
  while (true) {
    const messages = await fetchPage(before);
    if (messages.length === 0) break;
    for (const message of messages) {
      if (message.webhook_id !== webhookId) continue;
      for (const embed of message.embeds) {
        if (
          embed.title !== "🚍 AppalCART Service Update" ||
          embed.footer?.text !== "Source: AppalCART" ||
          !embed.description
        )
          continue;
        const endField = embed.fields?.find((field) => field.name === "End");
        const seconds = endField?.value.match(/<t:(\d+):/u)?.[1];
        if (!seconds)
          throw new Error(
            `Cannot recover expiration of AppalCART message ${message.id}`,
          );
        recovered.push({
          id: message.id,
          hash: announcementIdentity(embed.description),
          end: Number(seconds) * 1000,
          embed,
        });
      }
    }
    const lastId = messages[messages.length - 1].id;
    if (lastId === before)
      throw new Error("AppalCART history pagination did not advance");
    before = lastId;
  }
  return recovered;
}
