# Yosef Discord Bot

The Discord bot and Express API run together in `bot/`. The announcement and
application portal is the Next.js app in `webhooks/`.

## Production images

`.github/workflows/production.yml` follows the
[Housing Hub production workflow](https://github.com/TheTeaCup/mountaineer-housing-hub/blob/main/.github/workflows/backend-production.yml).
Pull requests build both Docker images; pushes to `main` publish:

- `ghcr.io/theteacup/yosef:latest`
- `ghcr.io/theteacup/yosef-portal:latest`

Each release also gets a `sha-<full-commit-sha>` tag and an immutable digest in
the Actions summary. The bot image runs its regression tests during the build.
The images target Linux AMD64.

For a different Discord application, set the GitHub Actions repository variable
`DISCORD_CLIENT_ID` to its public application ID before building. The portal
defaults to the existing Yosef application ID. This public ID is baked into the
portal image; it must match the bot's runtime `DISCORD_CLIENT_ID`.

Optional GitHub Actions secrets:

| Secret | Value |
| --- | --- |
| `COOLIFY_DEPLOY_WEBHOOK` | The deployment webhook for the entire Compose stack |
| `COOLIFY_API_TOKEN` | A Coolify API token permitted to deploy that stack |

When both secrets are set, the workflow requests a Coolify deployment only after
both images publish successfully. When neither is set, it publishes images for
manual deployment. Setting only one fails the deployment job with an explanation.
The webhook accepting a request does not mean the rollout has finished.

## Set up Coolify

1. Let the production workflow publish both images first. If the GHCR packages
   are private, configure the deployment server's registry credentials to pull
   them, or make the packages public.
2. Add this repository as a **Docker Compose** application. Set the base directory
   to `/` and the Compose file location to `/compose.yaml`. A Docker Compose Empty
   service containing the same definition also works, but its saved definition
   must be updated manually when this file changes.
3. Fill in the environment variables referenced by `compose.yaml`. Use
   `bot/example.env` as the checklist for Discord tokens, IDs, webhook URLs, and
   `JWT_SECRET`. Generate a JWT secret with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   No MySQL service is needed: the current bot does not use a database.
4. Assign the portal a domain routed to internal port **3000**, for example
   `https://portal.example.com:3000` in Coolify's domain configuration. The public
   URL is `https://portal.example.com`; the port suffix tells Coolify where to
   forward traffic. The bot listens internally on **3001**. A separate API domain
   is optional; the portal forwards `/api/*` to `http://bot:3001/*` itself.
5. Set `DISCORD_REDIRECT_URI` to the exact public portal callback URL, such as
   `https://portal.example.com/callback`, and add that same URL to the Discord
   application's OAuth2 redirect list.
6. Check Persistent Storages for the `bot-data` volume mounted at
   `/app/bot/data`. Migrate existing state as described below, then deploy.
7. Verify the bot logs in to Discord, the portal loads, Discord login returns to
   the portal, and sending an announcement works. `/api/health` should return
   `{"status":"ok"}`. The container checks cover HTTP availability, not Discord
   permissions or an end-to-end login.

Keep exactly **one running bot instance** for the Discord application. Stop the
old host before starting the Coolify bot, disable preview deployments for this
stack, and avoid overlapping rollouts. Bot state uses a local file rather than
shared locks between replicas.

Coolify owns TLS and public routing. The Compose file exposes container ports to
its network without publishing host ports. Storage and domain configuration
follow the [Coolify Compose guide](https://coolify.io/docs/applications/builds/docker-compose).

## Preserve existing bot messages

Before replacing the old container, stop its bot and back up:

- `dist/data/appalcartMessages.json` (or `src/data/appalcartMessages.json` when
  running TypeScript): existing Discord announcement IDs and expiration times.
- `src/data/rulesMessage.json` and `src/data/hash.txt`, if present: the current
  rules message ID and content hash.

Place these files in the new `bot-data` volume as `appalcartMessages.json`,
`rulesMessage.json`, and `hash.txt` **before starting the new bot**. Ensure they
are writable by the container's `node` user (UID/GID 1000). The default rules
message record is included in the image for new installations.

The watcher can import legacy files still present in the same installation, but
a new image cannot read files from a removed container. Runtime announcement
state is deliberately excluded from image builds. A missing migration can cause
one fresh post and leave old messages without tracked IDs.

AppalCART IDs and rules message state now live under `BOT_DATA_DIR`, defaulting
locally to `bot/data` and in Docker to `/app/bot/data`. Rules content and the role
panel configuration remain in source control. `TZ=America/New_York` ensures feed
dates without an explicit timezone are interpreted in AppalCART's local timezone.

Keep the same Coolify resource, Compose service names, and volume when deploying
updates. Set `IMAGE_TAG=sha-<full-commit-sha>` to pin or roll back both images to a
release; leave it unset for `latest`. Back up the volume separately; persistent
storage is not a backup. See [Coolify persistent storage](https://coolify.io/docs/applications/configuration/persistent-storage).

## Local development and image builds

Copy `bot/example.env` to `bot/.env` and fill it in. From `bot/`, run `npm ci`,
`npm test`, and `npm run dev`. From `webhooks/`, run `npm ci` and `npm run dev`.
The portal's `/api` proxy defaults to `http://127.0.0.1:3001` locally. Override
`API_INTERNAL_URL` when building for a different backend address.

To build both images locally, provide the Compose variables in a root `.env`
file (never commit credentials), then run:

```sh
docker compose -f compose.yaml -f compose.build.yaml build
docker compose -f compose.yaml -f compose.build.yaml up -d
```

These commands use the internal Compose network. For local browser access add a
local Compose override mapping `127.0.0.1:3000:3000` on `portal`, or use Coolify's
domain routing on the deployment server.
