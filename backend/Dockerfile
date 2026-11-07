FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000 \
    DEMO_SEED=false

# Install production dependencies for backend
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy backend source code and utility scripts
COPY --chown=node:node backend/src ./backend/src
COPY --chown=node:node backend/scripts ./backend/scripts

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "backend/src/server.js"]
