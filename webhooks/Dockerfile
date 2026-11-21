FROM node:24-bookworm-slim AS build
WORKDIR /app/webhooks
ENV NEXT_TELEMETRY_DISABLED=1
ARG API_INTERNAL_URL=http://bot:3001
ARG NEXT_PUBLIC_DISCORD_CLIENT_ID=1489747568908042390
ENV API_INTERNAL_URL=$API_INTERNAL_URL NEXT_PUBLIC_DISCORD_CLIENT_ID=$NEXT_PUBLIC_DISCORD_CLIENT_ID
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app/webhooks
COPY --from=build --chown=node:node /app/webhooks/.next/standalone ./
COPY --from=build --chown=node:node /app/webhooks/.next/static ./.next/static
COPY --from=build --chown=node:node /app/webhooks/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
