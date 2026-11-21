# Yosef Discord Bot

The Discord bot and Express API in `bot/` run on Coolify. The announcement and
application portal in `webhooks/` stays on its existing Cloudflare Workers deployment.

## Production image

`.github/workflows/production.yml` follows the
[Housing Hub production workflow](https://github.com/TheTeaCup/mountaineer-housing-hub/blob/main/.github/workflows/backend-production.yml).
Pull requests build the bot image. Pushes to `main` publish
`ghcr.io/theteacup/yosef:latest`, plus a `sha-<full-commit-sha>` tag. The Actions
summary records the immutable image digest. The image targets Linux AMD64.
Portal changes are deployed through the existing Cloudflare process.

Optional GitHub Actions secrets:

| Secret | Value |
| --- | --- |
| `COOLIFY_DEPLOY_WEBHOOK` | Deployment webhook for the bot's Coolify resource |
| `COOLIFY_API_TOKEN` | A Coolify API token permitted to deploy that resource |

When both secrets are set, Actions requests deployment after the bot image
publishes successfully. With neither set, deploy the image manually. Setting only
one fails the deployment job with an explanation. Webhook acceptance does not
mean the rollout has finished. Disable Coolify's separate push-triggered auto
deployment when using this workflow to avoid deploying before image publication.

## Set up Coolify: bot and API

1. Push these files to `main` and let **Bot production image** finish. For private
   GHCR packages, configure registry credentials on the deployment server, or
   make the package public.
2. Add `TheTeaCup/yosef` as a **Docker Compose** application, branch `main`, base
   directory `/`, Compose file `/compose.yaml`. A Docker Compose Empty service
   using the same definition also works; update its saved definition manually
   when the repository's Compose file changes.
3. Fill in the `DISCORD_*` variables and `JWT_SECRET` referenced by `compose.yaml`.
   Use `bot/example.env` as the checklist. MySQL is not used by the current bot.
   Generate a JWT secret with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. Assign the **bot** service the public API domain routed to internal port
   **3001**, for example `https://yosef-api.hunterwilson.dev:3001` in Coolify's
   domain field. The public URL remains `https://yosef-api.hunterwilson.dev`.
   Point that hostname's DNS to your Coolify server.
5. Set `DISCORD_REDIRECT_URI` to the **Cloudflare portal's** public callback URL,
   such as `https://your-portal-domain.com/callback`. Add the exact same URL to
   the Discord application's OAuth2 redirect list.
6. Confirm the `bot-data` volume is mounted at `/app/bot/data`. Migrate existing
   message state as described below before starting the replacement bot.
7. Deploy. Check Discord login in the bot logs, and visit
   `https://your-api-domain.com/health` for `{"status":"ok"}`. Then test login and
   sending an announcement from the Cloudflare portal.

Keep exactly **one running bot instance** for this Discord application. Stop the
old host before starting the Coolify bot, disable preview deployments, and avoid
overlapping rollouts. File-based state does not coordinate multiple replicas.
The health check covers HTTP availability, not Discord permissions or OAuth.

Coolify handles TLS and routes the API domain to container port 3001. The Compose
file uses an internal exposed port without publishing a host port. See the
[Coolify Compose guide](https://coolify.io/docs/applications/builds/docker-compose).

## Cloudflare Workers: existing portal

Keep the current Workers deployment process. Configure these public **build**
environment variables there (also listed in `webhooks/example.env`):

```dotenv
NEXT_PUBLIC_API_URL=https://yosef-api.hunterwilson.dev
NEXT_PUBLIC_DISCORD_CLIENT_ID=1489747568908042390
```

Use your Coolify API's public HTTPS origin for `NEXT_PUBLIC_API_URL`, with no
`/api` suffix. It defaults to the existing API domain above. Use the same Discord
application ID as the bot. Rebuild/redeploy the Worker after changing either
value, because Next.js embeds public environment values during the build.
Do not put the Discord client secret, bot token, or JWT secret in public variables.

The portal calls the API directly across origins; Express already enables CORS.
There is no portal container or Docker network proxy in this setup. Keep the
portal's existing domain and match its callback URL in Discord and Coolify.

## Preserve existing bot messages

Before replacing the old container, stop its bot and back up:

- `dist/data/appalcartMessages.json` (or `src/data/appalcartMessages.json` when
  running TypeScript): existing announcement message IDs and expiration times.
- `src/data/rulesMessage.json` and `src/data/hash.txt`, if present: the current
  rules message ID and content hash.

Put these files in the new `bot-data` volume as `appalcartMessages.json`,
`rulesMessage.json`, and `hash.txt` **before starting the new bot**. Make them
writable by the container's `node` user (UID/GID 1000). The default rules message
record is included in the image for new installations.

Legacy files can be imported when present in the same installation. If startup
finds no saved announcement IDs, the bot recovers its existing automated
AppalCART posts from the webhook channel before sending anything new. The bot
needs View Channel and Read Message History permissions there. If recovery fails,
posting waits and retries instead of blindly reposting. Existing automated
duplicates are tracked for expiration; recovery does not delete active copies.
New automated notices contain no role mention. Announcement state is deliberately
excluded from image builds; keep the persistent volume even with this recovery.

Runtime state lives under `BOT_DATA_DIR`: locally `bot/data`, in Docker
`/app/bot/data`. Rules content and role panel configuration remain in source
control. Docker sets `TZ=America/New_York` for feed dates without an explicit zone.

Keep the same Coolify resource, service name, and volume across deployments.
Set `IMAGE_TAG=sha-<full-commit-sha>` to pin or roll back a release; leave it unset
for `latest`. Back up the volume separately. See
[Coolify persistent storage](https://coolify.io/docs/applications/configuration/persistent-storage).

## Local development and image builds

Copy `bot/example.env` to `bot/.env` and fill it in. From `bot/`, run `npm ci`,
`npm run build`, and `npm run dev`. For portal development, copy `webhooks/example.env`
to `webhooks/.env.local`, set `NEXT_PUBLIC_API_URL=http://localhost:3001`, then
run `npm ci` and `npm run dev` from `webhooks/`.

To build the bot image locally, supply the Compose variables in a root `.env`
file (never commit credentials), then run:

```sh
docker compose -f compose.yaml -f compose.build.yaml build
docker compose -f compose.yaml -f compose.build.yaml up -d
```

Use Coolify's domain routing in production. For local API access from this
container, add a local Compose override mapping `127.0.0.1:3001:3001` on `bot`.
