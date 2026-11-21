FROM node:24-bookworm-slim AS build
WORKDIR /app/bot
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3001 TZ=America/New_York BOT_DATA_DIR=/app/bot/data
WORKDIR /app/bot
COPY --from=build --chown=node:node /app/bot/node_modules ./node_modules
COPY --from=build --chown=node:node /app/bot/dist ./dist
COPY --chown=node:node package.json ./
COPY --chown=node:node healthcheck.cjs ./
COPY --chown=node:node src/data/rules.txt src/data/rulesMessage.json ./dist/data/
RUN mkdir -p /app/bot/data && chown node:node /app/bot/data
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "/app/bot/healthcheck.cjs"]
CMD ["node", "dist/index.js"]
