import { Client, ChannelType, TextChannel } from "discord.js";
import { rolePanel } from "../data/rolePanel.js";
import { buildRolePanel } from "./buildRolePanel.js";
import logger from "./logger.js";

export async function deployRolePanels(client: Client) {
  for (const panel of rolePanel) {
    const channel = await client.channels.fetch(panel.channelId);

    if (!channel || channel.type !== ChannelType.GuildText) continue;

    const textChannel = channel as TextChannel;

    const { embed, rows } = buildRolePanel(panel);

    try {
      const message = await textChannel.messages.fetch(panel.messageId);

      await message.edit({
        embeds: [embed],
        components: rows.map((r) => r.toJSON()),
      });
    } catch {
      const message = await textChannel.send({
        embeds: [embed],
        components: rows.map((r) => r.toJSON()),
      });

      panel.messageId = message.id;
      logger.info(`Created ${panel.name} panel: ${message.id}`);
    }
  }
}
