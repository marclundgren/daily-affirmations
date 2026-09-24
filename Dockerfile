# syntax=docker/dockerfile:1

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run typecheck && npm test && npm run build

# The server is bundled into a single file, so the runtime image needs no node_modules.
FROM node:22-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4410 DATA_DIR=/data CLIENT_DIR=/app/client
WORKDIR /app
COPY --from=build /app/dist/server.js ./server.js
COPY --from=build /app/dist/client ./client
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 4410
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:4410/api/config').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
