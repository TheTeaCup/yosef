import { REST, Routes, Interaction } from "discord.js";

import fs from "fs";
import path from "path";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import Logger from "./utils/logger.js";
import { ExtendedClient } from "./types/client.js";
import "./webserver/index.js";

Logger.start();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const start = async () => {
  const client = new ExtendedClient({
    intents: [
      "Guilds",
      "GuildMessages",
      "DirectMessages",
      "MessageContent",
      "GuildMembers",
    ],
    allowedMentions: { parse: [] },
  });

  // Load commands
  const commands: any[] = [];
  const commandsPath = path.join(__dirname, "slash-commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of commandFiles) {
    const { default: command } = await import(`./slash-commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }

  // Register slash commands
  const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

  (async () => {
    try {
      Logger.info("Registering slash commands...");
      await rest.put(
        Routes.applicationGuildCommands(
          config.DISCORD_CLIENT_ID,
          config.DISCORD_GUILD_ID,
        ),
        { body: commands },
      );
      Logger.info("Slash commands registered.");
    } catch (error) {
      Logger.error(`${error}`);
    }
  })();

  const eventFiles = await readdir(join(__dirname, "./events"));
  for (const file of eventFiles) {
    const { default: event } = await import(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  client
    .login(config.DISCORD_TOKEN)
    .then(() => Logger.info("Logged into Discord successfully"))
    .catch((err) => {
      Logger.error("Error logging into Discord", err);
      process.exit();
    });
};

void start();
