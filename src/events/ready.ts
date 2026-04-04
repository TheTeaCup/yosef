import { Events, ActivityType } from "discord.js";
import { ExtendedClient } from "../types/client";
import { deployRolePanels } from "../utils/deployRolePanel.js";
import chalk from "chalk";
import { loadData, updateRulesMessage } from "../utils/rulesEmbed";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: ExtendedClient) {
    console.log(chalk.green.bold(`[App State] Bot is up and ready to go!`));

    await deployRolePanels(client);

    const data = loadData();
    try {
      const channel = await client.channels.fetch(data.channelId);

      if (!channel || !channel.isTextBased()) {
        console.error("Invalid channel.");
        return;
      }

      await updateRulesMessage(channel);
    } catch (err) {
      console.error("Failed to update rules:", err);
    }

    const statuses = [
      { name: "Watching kraut creek", type: ActivityType.Watching },
      {
        name: "Watching sanford mall",
        type: ActivityType.Watching,
      },
      {
        name: "Waiting on the AppalCART",
        type: ActivityType.Playing,
      },
      {
        name: "Watching the clouds go over Howards Knob",
        type: ActivityType.Watching,
      },
      {
        name: "Yelling on the 3rd floor of the library",
        type: ActivityType.Playing,
      },
      {
        name: "Sleeping in the Solarium...",
        type: ActivityType.Playing,
      },
    ];

    let index = 0;

    const updateStatus = () => {
      const status = statuses[index];

      client.user?.setPresence({
        activities: [{ name: status.name, type: status.type }],
        status: "online",
      });

      index = (index + 1) % statuses.length;
    };

    updateStatus(); // set immediately
    setInterval(updateStatus, 5 * 60 * 1000); // every 5 minutes
  },
};
