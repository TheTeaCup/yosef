export type RoleConfig = {
    label: string;
    roleId: string;
    customId: string;
};

export type RolePanel = {
    name: string;
    channelId: string;
    messageId: string;
    exclusive?: boolean;
    embed: {
        title: string;
        description: string;
        color: number;
    };
    roles: RoleConfig[];
};

export const rolePanel: RolePanel[] = [
    {
        name: "community",
        channelId: "1489745237814546562",
        messageId: "1489758303016980561", // leave blank first time
        exclusive: true,

        embed: {
            title: "🎓 Community Roles",
            description:
                "Choose roles that describe your connection to App State.",
            color: 0xffb81c,
        },
        roles: [
            {
                label: "Alumni",
                roleId: "1489745419482169586",
                customId: "alumni_role",
            },
            {
                label: "Graduate",
                roleId: "1489745509789991072",
                customId: "graduate_role",
            },
            {
                label: "Undergraduate",
                roleId: "1489745346438369320",
                customId: "undergraduate_role",
            },
            {
                label: "Prospective Transfer",
                roleId: "1489745460821360732",
                customId: "prospective_transfer_role",
            },
            {
                label: "Prospective Freshman",
                roleId: "1489745537795227759",
                customId: "prospective_freshman_role",
            },
            {
                label: "Visitor",
                roleId: "1489745566496985098",
                customId: "visitor_role",
            }
        ],
    },
    {
        name: "updates",
        channelId: "1489745237814546562",
        messageId: "1489758304686047372",

        embed: {
            title: "📢 Update Roles",
            description:
                "Select what notifications you want to receive.",
            color: 0x2e86de,
        },

        roles: [
            {
                label: "AppalCART Updates",
                roleId: "1489747165864792185",
                customId: "appalcart_updates_role",
            },
            {
                label: "University Updates",
                roleId: "1489754999926948052",
                customId: "university_updates_role",
            },
            {
                label: "Event Updates",
                roleId: "1489755044550283304",
                customId: "event_updates_role",
            },

        ],
    },
];