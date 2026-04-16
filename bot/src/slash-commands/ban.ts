import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { SlashCommand } from "../types/command";
import { config } from "../config.js";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to ban")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the ban")
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

    const targetMember = interaction.guild.members.cache.get(targetUser.id);

    if (!targetMember) {
      await interaction.reply({
        content: "⚠️ That user is not in this server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!targetMember.bannable) {
      await interaction.reply({
        content:
          "❌ I cannot ban this user (they might have higher permissions than me).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await targetMember.ban({ reason });
      await interaction.reply({
        content: `✅ Banned **${targetUser.tag}** for reason: "${reason}"`,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ There was an error trying to ban this user.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
