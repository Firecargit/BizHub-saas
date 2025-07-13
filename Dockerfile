# Stage 1: Backend Builder
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend .
RUN npm run build

# Stage 2: Frontend Builder
FROM node:18-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Stage 3: Production Backend
FROM node:18-alpine
WORKDIR /app
COPY --from=backend /app/package*.json ./
COPY --from=backend /app/node_modules ./node_modules
COPY --from=backend /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]

# Stage 4: Production Frontend
FROM nginx:alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80