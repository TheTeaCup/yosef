import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } from "discord.js";
  import { RolePanel } from "../data/rolePanel.js";
  
  export function buildRolePanel(panel: RolePanel): {
    embed: EmbedBuilder;
    rows: ActionRowBuilder<ButtonBuilder>[];
  } {
    const embed = new EmbedBuilder()
      .setTitle(panel.embed.title)
      .setDescription(panel.embed.description)
      .setColor(panel.embed.color)
      .setFooter({ text: "You can change your roles anytime!" });
  
    // 🔥 Support multiple rows (5 buttons max per row)
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();
  
    panel.roles.forEach((role, index) => {
      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
  
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(role.customId)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Secondary),
      );
  
      embed.addFields({
        name: role.label,
        value: `<@&${role.roleId}>`,
        inline: true,
      });
  
      // Push last row
      if (index === panel.roles.length - 1) {
        rows.push(currentRow);
      }
    });
  
    return { embed, rows };
  }