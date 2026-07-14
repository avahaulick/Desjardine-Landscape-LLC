# Build frontend
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps
COPY client/ ./
RUN npm run build

# Install server dependencies
FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

# Runtime image
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist
COPY images ./images

EXPOSE 4000
CMD ["node", "server/index.js"]
