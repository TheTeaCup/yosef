import crypto from "crypto";
import type { APIEmbed } from "discord.js";

const ROLE_ID = "111111"; //"1489747165864792185";

export type StoredMessage = {
  id: string;
  hash: string;
  end: number;
  embed?: APIEmbed;
};

type AnnouncementGroup = {
  type: string;
  announcements: { text: string; start: string; end: string }[];
};

type Dependencies = {
  webhook: {
    send(options: {
      content: string;
      embeds: APIEmbed[];
      allowedMentions: { roles: string[] };
    }): Promise<{ id: string }>;
    editMessage(
      id: string,
      options: { embeds: APIEmbed[]; allowedMentions: { parse: never[] } },
    ): Promise<unknown>;
    deleteMessage(id: string): Promise<unknown>;
    fetchMessage(id: string): Promise<{ embeds: APIEmbed[] }>;
  };
  loadStored(): StoredMessage[];
  saveStored(entries: StoredMessage[]): void;
  fetchAnnouncements(): Promise<AnnouncementGroup[]>;
  now?: () => number;
  logError?: (message: string, error: unknown) => void;
};

function hash(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function identity(text: string) {
  // The feed can roll the dates forward on the same ongoing notice.
  return hash(text.trim().replace(/\s+/g, " "));
}

function unknownMessage(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 10008
  );
}

export function createAppalcartWatcher(dependencies: Dependencies) {
  const { webhook, loadStored, saveStored, fetchAnnouncements } = dependencies;
  const logError = dependencies.logError ?? console.error;
  let running = false;

  return async function runAppalcartWatcher() {
    if (running) return;
    running = true;
    try {
      let stored = loadStored();
      // Commit migrated state and verify storage before any Discord mutation.
      saveStored(stored);
      const now = (dependencies.now ?? Date.now)();
      let announcements: AnnouncementGroup[] = [];
      try {
        announcements = await fetchAnnouncements();
      } catch (error) {
        // Retain IDs during outages, but still clean up known expired messages.
        logError("Failed to fetch AppalCART updates:", error);
      }

      const active = new Map<
        string,
        { embed: APIEmbed; end: number; legacyHash: string }
      >();
      for (const group of announcements) {
        if (group.type === "normal") continue;
        for (const announcement of group.announcements) {
          const start = new Date(announcement.start).getTime();
          const end = new Date(announcement.end).getTime();
          if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            now < start ||
            now >= end
          )
            continue;
          active.set(identity(announcement.text), {
            end,
            legacyHash: hash(announcement.text + announcement.start),
            embed: {
              title: "🚍 AppalCART Service Update",
              description: announcement.text,
              color: group.type === "high" ? 0xff3b30 : 0x5865f2,
              fields: [
                {
                  name: "Start",
                  value: `<t:${Math.floor(start / 1000)}:F>`,
                  inline: true,
                },
                {
                  name: "End",
                  value: `<t:${Math.floor(end / 1000)}:F>`,
                  inline: true,
                },
              ],
              footer: { text: "Source: AppalCART" },
            },
          });
        }
      }

      // Older versions batched notices: expiring one must not delete the others.
      let reconciliationFailed = false;
      for (const id of new Set(stored.map((entry) => entry.id))) {
        const previous = stored.filter((entry) => entry.id === id);
        try {
          let legacyEmbeds: APIEmbed[] = [];
          if (previous.some((entry) => !entry.embed)) {
            legacyEmbeds = (await webhook.fetchMessage(id)).embeds;
          }
          const updated = previous.map((entry) => {
            const matchingAnnouncement = [...active.values()].find(
              (value) => value.legacyHash === entry.hash,
            );
            const legacyIndex = legacyEmbeds.findIndex((embed) => {
              if (matchingAnnouncement)
                return (
                  embed.description === matchingAnnouncement.embed.description
                );
              const endField = embed.fields?.find(
                (field) => field.name === "End",
              );
              const seconds = endField?.value.match(/<t:(\d+):/u)?.[1];
              return (
                seconds !== undefined &&
                Number(seconds) === Math.floor(entry.end / 1000)
              );
            });
            const oldEmbed =
              entry.embed ??
              (legacyIndex >= 0
                ? legacyEmbeds.splice(legacyIndex, 1)[0]
                : undefined);
            const key = oldEmbed?.description
              ? identity(oldEmbed.description)
              : entry.hash;
            const current =
              active.get(key) ??
              [...active.values()].find(
                (value) => value.legacyHash === entry.hash,
              );
            if (!current) return { ...entry, hash: key, embed: oldEmbed };
            // Preserve the original posting timestamp when editing dates.
            const embed = {
              ...current.embed,
              ...(oldEmbed?.timestamp ? { timestamp: oldEmbed.timestamp } : {}),
            };
            return {
              id,
              hash: identity(embed.description!),
              end: current.end,
              embed,
            };
          });
          const remaining = updated.filter((entry) => entry.end > now);
          if (remaining.length === 0) {
            await webhook.deleteMessage(id);
          } else if (JSON.stringify(previous) !== JSON.stringify(remaining)) {
            if (remaining.some((entry) => !entry.embed))
              throw new Error("Cannot recover stored AppalCART embeds");
            await webhook.editMessage(id, {
              embeds: remaining.map((entry) => entry.embed!),
              allowedMentions: { parse: [] },
            });
          }
          stored = stored.filter((entry) => entry.id !== id).concat(remaining);
          saveStored(stored);
        } catch (error) {
          if (unknownMessage(error)) {
            stored = stored.filter((entry) => entry.id !== id);
            saveStored(stored);
          } else {
            // Keep the original state so edits/deletions are retried next poll.
            reconciliationFailed = true;
            logError(`Failed to reconcile AppalCART message ${id}:`, error);
          }
        }
      }

      // A legacy message may already contain one of these notices. Resolve its
      // identity before posting anything new after a transient Discord error.
      if (reconciliationFailed) return;
      for (const [key, announcement] of active) {
        if (
          stored.some(
            (entry) =>
              entry.hash === key ||
              entry.hash === announcement.legacyHash ||
              (entry.embed?.description &&
                identity(entry.embed.description) === key),
          )
        )
          continue;
        const embed = {
          ...announcement.embed,
          timestamp: new Date(now).toISOString(),
        };
        const message = await webhook.send({
          content: `<@&${ROLE_ID}>`,
          embeds: [embed],
          allowedMentions: { roles: [ROLE_ID] },
        });
        stored.push({
          id: message.id,
          hash: key,
          end: announcement.end,
          embed,
        });
        // Save each successful send before attempting another announcement.
        saveStored(stored);
      }
      saveStored(stored);
    } catch (error) {
      logError("AppalCART watcher failed:", error);
    } finally {
      running = false;
    }
  };
}
