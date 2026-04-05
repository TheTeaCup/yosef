import chalk from "chalk";
import { version, WebhookClient } from "discord.js";
import { config } from "../config";

const webhook = new WebhookClient({
  url: config.DISCORD_LOG_WEBHOOK_URL,
});

function time(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
}

function prefix(level: string): string {
  return `[${time()} ${level}]:`;
}

const logger = {
  info(text: string): void {
    console.log(
      chalk.gray(`[${time()} `) + chalk.blue("INFO") + chalk.gray(`]: `) + text,
    );
  },

  warn(text: string, warn?: string): void {
    const msg = `${text} ${warn ?? ""}`.trim();

    console.log(
      chalk.gray(`[${time()} `) +
        chalk.yellow("WARN") +
        chalk.gray(`]: `) +
        msg,
    );
  },

  async error(text: string, err?: string): Promise<void> {
    const msg = `${text} ${err ?? ""}`.trim();

    console.log(
      chalk.gray(`[${time()} `) + chalk.red("ERROR") + chalk.gray(`]: `) + msg,
    );

    try {
      await webhook.send({
        content: `❌ ${prefix("ERROR")} ${msg}`,
      });
    } catch {
      console.log(
        chalk.gray(`[${time()} `) +
          chalk.red("ERROR") +
          chalk.gray(`]: Failed to send webhook log`),
      );
    }
  },

  async toDiscord(text: string): Promise<void> {
    try {
      await webhook.send({
        content: text,
      });
    } catch {
      console.log(
        chalk.gray(`[${time()} `) +
          chalk.red("ERROR") +
          chalk.gray(`]: Failed to send webhook log`),
      );
    }
  },

  start(): void {
    console.log(
      chalk.hex("#228B22")(
        `                                                          
        $$\     $$\  $$$$$$\   $$$$$$\  $$$$$$$$\ $$$$$$$$\ 
        \$$\   $$  |$$  __$$\ $$  __$$\ $$  _____|$$  _____|
         \$$\ $$  / $$ /  $$ |$$ /  \__|$$ |      $$ |      
          \$$$$  /  $$ |  $$ |\$$$$$$\  $$$$$\    $$$$$\    
           \$$  /   $$ |  $$ | \____$$\ $$  __|   $$  __|   
            $$ |    $$ |  $$ |$$\   $$ |$$ |      $$ |      
            $$ |     $$$$$$  |\$$$$$$  |$$$$$$$$\ $$ |      
            \__|     \______/  \______/ \________|\__|            
        
        Node Version: ${process.version}
        Discord.js Version: ${version}
        `,
      ),
    );
  },
};

export default logger;
