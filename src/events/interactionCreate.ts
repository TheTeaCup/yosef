import { Interaction, Events } from "discord.js";
import { handleButton } from "../handlers/buttonHandler.js";
import handleCommand from "../handlers/commandHandler.js";
import { ExtendedClient } from "../types/client";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: ExtendedClient) {
    try {
      if (interaction.isChatInputCommand()) {
        return handleCommand(interaction, client);
      }

      if (interaction.isButton()) {
        return handleButton(interaction);
      }

      // future:
      // if (interaction.isStringSelectMenu()) ...
      // if (interaction.isModalSubmit()) ...
    } catch (err) {
      console.error("Interaction error:", err);
    }
  },
};
