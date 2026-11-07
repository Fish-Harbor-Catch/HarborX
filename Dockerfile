# Multi-stage monolithic build for HarborX (Backend + Frontend)
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --no-audit --no-fund

COPY frontend frontend
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=5000 DEMO_SEED=false
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --chown=node:node backend/src backend/src
COPY --chown=node:node backend/scripts backend/scripts
COPY --from=build --chown=node:node /app/frontend/dist frontend/dist

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "backend/src/server.js"]
