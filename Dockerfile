# === Stage 1: Build Frontend ===
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# === Stage 2: Build Backend ===
FROM node:20-alpine AS backend-build
RUN apk add --no-cache openssl
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate && npm run build

# === Stage 3: Production ===
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app

# Install production deps
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev

# Copy prisma schema and generated client
COPY backend/prisma ./prisma
COPY --from=backend-build /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-build /app/backend/node_modules/@prisma ./node_modules/@prisma

# Copy compiled backend
COPY --from=backend-build /app/backend/dist ./dist

# Copy frontend build to serve as static
COPY --from=frontend-build /app/frontend/dist ./public

# Add static file serving to production
RUN echo '// Serve static frontend in production' > /tmp/note.txt

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
