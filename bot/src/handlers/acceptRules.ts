import { ButtonInteraction, MessageFlags } from "discord.js";
import { config } from "../config.js";

async function handleAcceptRules(interaction: ButtonInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "This can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const roleId = config.DISCORD_DEFAULT_ROLE;

  const member = await interaction.guild.members.fetch(interaction.user.id);

  if (member.roles.cache.has(roleId)) {
    return interaction.reply({
      content: "You already have access!",
      flags: MessageFlags.Ephemeral,
    });
  }

  await member.roles.add(roleId);

  await interaction.reply({
    content: "✅ You now have access to the server!",
    flags: MessageFlags.Ephemeral,
  });
}

export default handleAcceptRules;
