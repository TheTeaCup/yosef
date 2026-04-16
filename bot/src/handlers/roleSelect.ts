import { Interaction, MessageFlags } from "discord.js";
import { rolePanel, RoleConfig } from "../data/rolePanel.js";

async function handleRoleSelect(interaction: Interaction) {
  if (!interaction.guild || !interaction.isButton()) return;

  // Find panel + role
  let selectedPanel: (typeof rolePanel)[0] | null = null;
  let roleConfig: RoleConfig | null = null;

  for (const panel of rolePanel) {
    const found = panel.roles.find((r) => r.customId === interaction.customId);

    if (found) {
      selectedPanel = panel;
      roleConfig = found;
      break;
    }
  }

  if (!roleConfig || !selectedPanel) return;

  const currentRoleConfig = roleConfig;
  const currentPanel = selectedPanel;

  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = await interaction.guild.members.fetch(interaction.user.id);

    const hasRole = member.roles.cache.has(currentRoleConfig.roleId);

    // Exclusive panel logic
    if (currentPanel.exclusive) {
      const rolesToRemove = currentPanel.roles
        .map((r) => r.roleId)
        .filter((id) => id !== currentRoleConfig.roleId)
        .filter((id) => member.roles.cache.has(id));

      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove);
      }
    }

    // Toggle the selected role
    if (hasRole) {
      await member.roles.remove(currentRoleConfig.roleId);
      await interaction.editReply({
        content: `✅ You have **removed** the role <@&${currentRoleConfig.roleId}>.`,
      });
    } else {
      await member.roles.add(currentRoleConfig.roleId);
      await interaction.editReply({
        content: `✅ You now have the role <@&${currentRoleConfig.roleId}>.`,
      });
    }
  } catch (error) {
    console.error("Role toggle error:", error);
    await interaction.editReply({
      content: "❌ Failed to update your role.",
    });
  }
}

export default handleRoleSelect;
