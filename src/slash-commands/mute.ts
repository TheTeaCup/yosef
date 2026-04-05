import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { SlashCommand } from "../types/command";
import { config } from "../config";

function parseDuration(duration: string): number | null {
  // Simple parser: number + s/m/h/d
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user in the server for a certain time.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("User to mute").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for mute")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration (e.g., 10m, 2h, 1d)")
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.member) return;

    const executor = interaction.guild.members.cache.get(interaction.user.id);

    if (!executor?.roles.cache.has(config.DISCORD_STAFF_ROLE)) {
      await interaction.reply({
        content: "❌ You don't have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const durationStr = interaction.options.getString("duration", true);

    const duration = parseDuration(durationStr);
    if (!duration || duration <= 0) {
      await interaction.reply({
        content: "⚠️ Invalid duration. Use formats like `10m`, `2h`, `1d`.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetMember = interaction.guild.members.cache.get(targetUser.id);
    if (!targetMember) {
      await interaction.reply({
        content: "⚠️ That user is not in this server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!targetMember.moderatable) {
      await interaction.reply({
        content: "❌ I cannot mute this user (higher role than me).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await targetMember.timeout(duration, reason);
      await interaction.reply({
        content: `🔇 Muted **${targetUser.tag}** for ${durationStr} for reason: "${reason}"`,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ There was an error trying to mute this user.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
