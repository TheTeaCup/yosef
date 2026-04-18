import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from "../../config.js";

const router = Router();

router.post('/callback', async (req: Request, res: Response) => {
    const code = req.body?.code as string | undefined;

    if (!code) {
        return res.status(400).json({ error: 'No code provided in body' });
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: config.DISCORD_CLIENT_ID,
                client_secret: config.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: config.DISCORD_REDIRECT_URI,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // 2. Fetch user
        const userResponse = await axios.get(
            'https://discord.com/api/users/@me',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const user = userResponse.data;

        // 3. Check guild membership
        let isInGuild = false;
        let eventsRole = false;
        let serverAnnoucements = false;
        let appalcartAnnoucements = false;

        try {
            const guildMemberResponse = await axios.get(
                `https://discord.com/api/users/@me/guilds/${config.DISCORD_GUILD_ID}/member`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (guildMemberResponse.data?.user?.id) {
                isInGuild = true;
                eventsRole = guildMemberResponse.data?.roles?.includes("1494046051487973436") ?? false;
                serverAnnoucements = guildMemberResponse.data?.roles?.includes("1489745777319477359") ?? false;
                appalcartAnnoucements = guildMemberResponse.data?.roles?.includes("1489745777319477359") ?? false;
            }

            
        } catch (err) {
            console.log(err);
            isInGuild = false;
        }

        if (!isInGuild) {
            return res.json({
                error: 'joinGuild',
                user,
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.global_name || user.username,
                avatar: user.avatar,
                guildAccess: true,
                eventsRole,
                serverAnnoucements,
                appalcartAnnoucements,
            },
            config.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.json({
            token,
        });

    } catch (error: any) {
        console.error(error?.response?.data || error.message || error);

        return res.status(500).json({
            error: 'OAuth failed',
        });
    }
});

router.post('/valid-token', async (req: Request, res: Response) => {
    const token = req.body?.token;

    if (!token) {
        return res.status(400).json({ valid: false });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        return res.json({
            valid: true,
            user: decoded,
        });

    } catch {
        return res.json({
            valid: false,
        });
    }
});

export default router;