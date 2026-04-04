import { ChannelType, Events, Message } from "discord.js";
import { ExtendedClient } from "../types/client";
import { Event } from "../types/event";
import logger from "../utils/logger";

const event: Event = {
  name: Events.MessageCreate,
  async execute(message: Message, client: ExtendedClient) {
    if (message.author.bot || !message.guild) return;
    if (
      message.channel.type !== ChannelType.GuildText &&
      message.channel.type !== ChannelType.PublicThread &&
      message.channel.type !== ChannelType.PrivateThread
    ) {
      return;
    }

    // moderate discord invites
    const discordInviteRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9-]+/i;
    if (discordInviteRegex.test(message.content)) {
      const warningMessage = await message.channel.send(
        `${message.author}, you cannot send Discord invites here.`,
      );

      setTimeout(async () => {
        try {
          await warningMessage.delete();
        } catch (error) {
          logger.error("Failed to delete the warning message: " + error);
        }
      }, 2_500);

      return;
    }

    if (!message.content.startsWith(`<@${client.user?.id}>`)) return;

    const args = message.content
      .slice(`<@${client.user?.id}>`.length)
      .trim()
      .split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) {
      await message.react("👀");
      return;
    }
  },
};

export default event;