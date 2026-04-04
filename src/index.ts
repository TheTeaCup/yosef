import { REST, Routes, Interaction, MessageFlags } from "discord.js";

import fs from "fs";
import path from "path";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import Logger from "./utils/logger.js";
import { ExtendedClient } from "./types/client.js";
import { rolePanel, RoleConfig } from "./data/rolePanel.js";

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

    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.guild || !interaction.isButton()) return;

        // Find panel + role
        let selectedPanel: typeof rolePanel[0] | null = null;
        let roleConfig: RoleConfig | null = null;

        for (const panel of rolePanel) {
            const found = panel.roles.find(
                (r) => r.customId === interaction.customId,
            );

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

            const member = await interaction.guild.members.fetch(
                interaction.user.id,
            );

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
    });

    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.guild) return;
        // SLASH COMMANDS
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "Error executing command.",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "Error executing command.",
                    ephemeral: true,
                });
            }
        }
    });

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