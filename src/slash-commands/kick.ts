import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { SlashCommand } from "../types/command";

const REQUIRED_ROLE_ID = "1489808758744940685";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the kick")
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.member) return;

    const executor = interaction.guild.members.cache.get(interaction.user.id);

    // Role check
    if (!executor?.roles.cache.has(REQUIRED_ROLE_ID)) {
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

    if (!targetMember.kickable) {
      await interaction.reply({
        content:
          "❌ I cannot kick this user (they might have higher permissions than me).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await targetMember.kick(reason);
      await interaction.reply({
        content: `✅ Kicked **${targetUser.tag}** for reason: "${reason}"`,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ There was an error trying to kick this user.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
