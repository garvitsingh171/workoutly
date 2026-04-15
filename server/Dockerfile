# Use official Node.js 18 image on Alpine Linux
# Alpine = small, secure, production-ready
FROM node:18-alpine

# Set working directory inside container
# All subsequent commands run from /app
WORKDIR /app

# Copy package files first (for layer caching)
# If dependencies don't change, this layer is cached
COPY package*.json ./

# Install dependencies using npm ci
# npm ci = clean install, faster and more reliable
RUN npm ci

# Copy application source code
# Comes after npm ci so code changes don't bust cache
COPY . .

# Expose port 5000
# Documents which port the app listens on
EXPOSE 5000

# Command to start the server
# Adjust "server.js" if your entry file has a different name
CMD ["node", "server.js"]