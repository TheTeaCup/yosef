import type { StaffApp, EventApp } from "../schemas/applications.js";

export function buildStaffEmbed(
    discordId: string,
    app: StaffApp
  ) {
    return {
      title: "🛡️ New Staff Application",
      color: 0x5865f2,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "User",
          value: `<@${discordId}>`,
          inline: true,
        },
        {
          name: "Discord ID",
          value: discordId,
          inline: true,
        },
        {
          name: "Name",
          value: app.name,
          inline: true,
        },
        {
          name: "Email",
          value: app.email,
          inline: true,
        },
        {
          name: "LinkedIn",
          value: app.linkedin,
          inline: false,
        },
        {
          name: "Hours / Week",
          value: app.hoursPerWeek,
          inline: true,
        },
        {
          name: "Online Times",
          value: app.onlineTimes,
          inline: true,
        },
        {
          name: "Why Staff",
          value: app.whyStaff.slice(0, 1024),
          inline: false,
        },
        {
          name: "Scenario: Argumentative Member",
          value: app.argumentativeMember.slice(0, 1024),
          inline: false,
        },
        {
          name: "Scenario: Staff Misconduct",
          value: app.staffMisconduct.slice(0, 1024),
          inline: false,
        },
        {
          name: "Scenario: Member Dispute",
          value: app.memberDispute.slice(0, 1024),
          inline: false,
        },
      ],
    };
  }

  export function buildEventEmbed(
    discordId: string,
    app: EventApp
  ) {
    return {
      title: "📢 New Event Coordinator Application",
      color: 0xf1c40f,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "User",
          value: `<@${discordId}>`,
          inline: true,
        },
        {
          name: "Discord ID",
          value: discordId,
          inline: true,
        },
        {
          name: "Name",
          value: app.name,
          inline: true,
        },
        {
          name: "Email",
          value: app.email,
          inline: true,
        },
        {
          name: "Organization",
          value: app.organization,
          inline: false,
        },
      ],
    };
  }

