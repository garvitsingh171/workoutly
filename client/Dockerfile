# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Use custom Nginx config for SPA fallback and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx serves HTTP on port 80
EXPOSE 80