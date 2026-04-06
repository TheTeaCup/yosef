import { WebhookClient } from "discord.js";
import { config } from "../config.js";

const APPALCART_UPDATES = "https://appalcart.etaspot.net/service.php?service=get_service_announcements&token=appstate";
const webhook = new WebhookClient({
  url: config.DISCORD_APPALCART_WEBHOOK,
});

async function fetchAppalcartUpdates() {
  try {
    const response = await fetch(APPALCART_UPDATES);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.get_service_announcements) {
        if (data.get_service_announcements.length === 0) {
            console.log("No service announcements found.");
            return [];
        }

        if (data.get_service_announcements.length > 0) {
            console.log("Service announcements found:");
            data.get_service_announcements.forEach((announcement: any, index: number) => {
                console.log(`Announcement ${index + 1}:`, announcement);
            });
        }
    }
    // return data.announcements || [];
  } catch (error) {
    console.error("Failed to fetch Appalcart updates:", error);
    return [];
  }
}

fetchAppalcartUpdates();