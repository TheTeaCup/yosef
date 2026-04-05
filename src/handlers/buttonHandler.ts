import { ButtonInteraction } from "discord.js";
import handleAcceptRules from "./acceptRules.js";
import handleRoleSelect from "./roleSelect.js";

export async function handleButton(interaction: ButtonInteraction) {
  const { customId } = interaction;

  if (customId === "accept_rules") {
    return handleAcceptRules(interaction);
  }

  // ANY ROLE BUTTON (ends with _role)
  if (customId.endsWith("_role")) {
    return handleRoleSelect(interaction);
  }
}
